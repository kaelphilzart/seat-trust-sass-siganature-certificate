import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import {
  ICreateOrganizationUser,
  IUpdateOrganizationUser,
} from '@/types/organization-user';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import {
  OrganizationUserRow,
  OrganizationUserIdRow,
  UserCountRow,
} from '../interfaces/OrganizationUser.interface';
import { mapOrganizationUser } from '../mappers/OrganizationUser.mapper';

const CACHE_ALL_ORGANIZATIONS_USERS = 'organization_users:all';

// GET
export const getAllOrganizationUsers = async (organization_id?: string) => {
  const cacheKey = organization_id
    ? `${CACHE_ALL_ORGANIZATIONS_USERS}:${organization_id}`
    : CACHE_ALL_ORGANIZATIONS_USERS;

  const cached = await redis.get(cacheKey);
  if (cached) return cached;

  const conditions: string[] = [];
  const values: string[] = [];

  if (organization_id) {
    conditions.push('ou.organization_id = ?');
    values.push(organization_id);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const [rows] = await pool.query<OrganizationUserRow[]>(
    `
        SELECT 
            ou.id as organization_user_id,
            ou.role,
            ou.created_at as ou_created_at,
            ou.updated_at as ou_updated_at,

            u.id as user_id,
            u.email,
            u.is_active,
            u.created_at as user_created_at,
            u.updated_at as user_updated_at,

            o.id as organization_id,
            o.name as organization_name,
            o.slug as organization_slug,
            o.logo as organization_logo,
            o.created_at as org_created_at,
            o.updated_at as org_updated_at

        FROM organization_users ou
        LEFT JOIN users u ON u.id = ou.user_id
        LEFT JOIN organizations o ON o.id = ou.organization_id
        ${whereClause}
        `,
    values
  );

  const organizationUsers = rows.map(mapOrganizationUser);

  await redis.set(cacheKey, organizationUsers, { ex: 60 });

  return organizationUsers;
};

// GET BY ID
export const getOrganizationUserById = async (params: {
  id?: string;
  organization_id?: string;
  user_id?: string;
}) => {
  const conditions: string[] = [];
  const values: string[] = [];

  if (params.id) {
    conditions.push('ou.id = ?');
    values.push(params.id);
  }

  if (params.organization_id) {
    conditions.push('ou.organization_id = ?');
    values.push(params.organization_id);
  }

  if (params.user_id) {
    conditions.push('ou.user_id = ?');
    values.push(params.user_id);
  }

  if (!conditions.length) {
    throw new Error('At least one filter is required');
  }

  const whereClause = conditions.join(' AND ');

  const [rows] = await pool.query<OrganizationUserRow[]>(
    `
        SELECT 
            ou.id as organization_user_id,
            ou.role,
            ou.created_at as ou_created_at,
            ou.updated_at as ou_updated_at,

            u.id as user_id,
            u.email,
            u.is_active,
            u.created_at as user_created_at,
            u.updated_at as user_updated_at,

            o.id as organization_id,
            o.name as organization_name,
            o.slug as organization_slug,
            o.logo as organization_logo,
            o.created_at as org_created_at,
            o.updated_at as org_updated_at

        FROM organization_users ou
        LEFT JOIN users u ON u.id = ou.user_id
        LEFT JOIN organizations o ON o.id = ou.organization_id
        WHERE ${whereClause}
        LIMIT 1
        `,
    values
  );

  const row = rows[0];
  if (!row) return null;

  return mapOrganizationUser(row);
};

// POST
export const createOrganizationUser = async (
  data: ICreateOrganizationUser
): Promise<ICreateOrganizationUser> => {
  const id = randomUUID();

  await pool.query(
    `INSERT INTO organization_users
    (id, user_id, organization_id, role)
    VALUES (?, ?, ?, ?)`,
    [id, data.user_id, data.organization_id, data.role]
  );

  await redis.del(CACHE_ALL_ORGANIZATIONS_USERS);

  return {
    user_id: data.user_id,
    organization_id: data.organization_id,
    role: data.role,
  };
};

//create by param
export const createOrganizationUserByParam = async (
  organizationId: string,
  data: ICreateOrganizationUser
): Promise<ICreateOrganizationUser> => {
  const id = randomUUID();

  await pool.query(
    `INSERT INTO organization_users (id, user_id, organization_id, role)
   VALUES (?, ?, ?, ?)`,
    [id, data.user_id, organizationId, data.role]
  );

  await redis.del(`${CACHE_ALL_ORGANIZATIONS_USERS}:${organizationId}`);
  return {
    id,
    user_id: data.user_id,
    organization_id: organizationId,
    role: data.role,
  };
};

// ===============================
// (PATCH)
// ===============================
export const updateOrganizationUser = async (
  id: string,
  data: IUpdateOrganizationUser
) => {
  /* ================= ambil user_id ================= */

  const [rows] = await pool.query<OrganizationUserIdRow[]>(
    `SELECT user_id, organization_id
         FROM organization_users
         WHERE id = ?`,
    [id]
  );

  const row = rows[0];
  if (!row) return null;

  const userId = row.user_id;
  const organizationId = row.organization_id;

  /* ================= update role ================= */

  if (data.role) {
    await pool.query(
      `UPDATE organization_users
             SET role = ?, updated_at = NOW()
             WHERE id = ?`,
      [data.role, id]
    );
  }

  /* ================= update user ================= */

  const userFields: string[] = [];
  const userValues: (string | null)[] = [];

  if (data.email) {
    userFields.push('email = ?');
    userValues.push(data.email);
  }

  if (data.password) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    userFields.push('password = ?');
    userValues.push(hashedPassword);
  }

  if (userFields.length) {
    await pool.query(
      `UPDATE users
             SET ${userFields.join(', ')}, updated_at = NOW()
             WHERE id = ?`,
      [...userValues, userId]
    );
  }

  /* ================= cache ================= */

  await redis.del(`${CACHE_ALL_ORGANIZATIONS_USERS}:${organizationId}`);

  /* ================= return ================= */

  return getOrganizationUserById({ id });
};
// ===============================
// DELETE
// ===============================
export const deleteOrganizationUser = async (id: string): Promise<void> => {
  /* ================= ambil user ================= */

  const [rows] = await pool.query<OrganizationUserIdRow[]>(
    `SELECT user_id, organization_id 
         FROM organization_users 
         WHERE id = ?`,
    [id]
  );

  const row = rows[0];

  if (!row) {
    throw new Error('Organization user tidak ditemukan');
  }

  const userId = row.user_id;
  const organizationId = row.organization_id;

  /* ================= delete org user ================= */

  await pool.query(`DELETE FROM organization_users WHERE id = ?`, [id]);

  /* ================= cek apakah user masih dipakai ================= */

  const [countRows] = await pool.query<UserCountRow[]>(
    `SELECT COUNT(*) as total 
         FROM organization_users 
         WHERE user_id = ?`,
    [userId]
  );

  const total = countRows[0]?.total ?? 0;

  if (total === 0) {
    await pool.query(`DELETE FROM users WHERE id = ?`, [userId]);
  }

  /* ================= cache invalidation ================= */

  await redis.del(`${CACHE_ALL_ORGANIZATIONS_USERS}:${organizationId}`);
};
