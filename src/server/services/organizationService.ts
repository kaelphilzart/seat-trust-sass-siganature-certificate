import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { ICreateOrganization, IUpdateOrganization } from '@/types/organization';
import { randomUUID } from 'crypto';
import { OrganizationRow } from '../interfaces/Organization.interface';
import { mapOrganization } from '../mappers/Organization.mapper';

const CACHE_ALL_ORGANIZATIONS = 'organizations:all';

// GET
export const getAllOrganizations = async () => {
  const cached = await redis.get(CACHE_ALL_ORGANIZATIONS);
  if (cached) return cached;

  const [rows] = await pool.query<OrganizationRow[]>(
    `
        SELECT 
            o.*,
            s.id as subscription_id,
            s.plan_id,
            s.organization_id as subscription_org_id,
            s.start_date,
            s.end_date,
            s.status,
            s.created_at as sub_created_at,
            s.updated_at as sub_updated_at,
            p.id as plan_id,
            p.name as plan_name,
            p.price as plan_price
        FROM organizations o
        LEFT JOIN subscriptions s 
            ON s.organization_id = o.id
        LEFT JOIN plans p
            ON p.id = s.plan_id
        `
  );

  const organizations = rows.map(mapOrganization);

  await redis.set(CACHE_ALL_ORGANIZATIONS, organizations, { ex: 60 });

  return organizations;
};

// GET BY ID
export const getOrganizationById = async (id: string) => {
  const [rows] = await pool.query<OrganizationRow[]>(
    `
        SELECT 
            o.*,
            s.id as subscription_id,
            s.plan_id,
            s.organization_id as subscription_org_id,
            s.start_date,
            s.end_date,
            s.status,
            s.created_at as sub_created_at,
            s.updated_at as sub_updated_at,
            p.id as plan_id,
            p.name as plan_name,
            p.price as plan_price
        FROM organizations o
        LEFT JOIN subscriptions s 
            ON s.organization_id = o.id
        LEFT JOIN plans p
            ON p.id = s.plan_id
        WHERE o.id = ?
        LIMIT 1
        `,
    [id]
  );

  const row = rows[0];
  if (!row) return null;

  return mapOrganization(row);
};

// POST
export const createOrganization = async (
  organization: ICreateOrganization
): Promise<ICreateOrganization> => {
  const organizationId = randomUUID();
  await pool.query(
    `INSERT INTO organizations
        (id, name, slug, logo)
        VALUES (?, ?, ?, ?)`,
    [organizationId, organization.name, organization.slug, organization.logo]
  );
  await redis.del(CACHE_ALL_ORGANIZATIONS);
  return {
    id: organizationId,
    name: organization.name,
    slug: organization.slug,
    logo: organization.logo,
  };
};

// ===============================
// (PATCH)
// ===============================
export const updateOrganization = async (
  id: string,
  data: Partial<IUpdateOrganization>
) => {
  const allowedFields: (keyof IUpdateOrganization)[] = ['name', 'slug', 'logo'];

  const fields = Object.keys(data).filter((key) =>
    allowedFields.includes(key as keyof IUpdateOrganization)
  );

  if (!fields.length) {
    return getOrganizationById(id);
  }

  const values = fields.map(
    (field) => data[field as keyof IUpdateOrganization]
  ) as (string | null)[];

  const setClause = fields.map((field) => `${field} = ?`).join(', ');

  await pool.query(
    `
        UPDATE organizations 
        SET ${setClause}, updated_at = NOW() 
        WHERE id = ?
        `,
    [...values, id]
  );

  await redis.del(CACHE_ALL_ORGANIZATIONS);
  await redis.del(`${CACHE_ALL_ORGANIZATIONS}:${id}`);
  return getOrganizationById(id);
};

// ===============================
// DELETE
// ===============================
export const deleteOrganization = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM organizations WHERE id = ?', [id]);
  await redis.del(CACHE_ALL_ORGANIZATIONS);
  await redis.del(`${CACHE_ALL_ORGANIZATIONS}:${id}`);
};
