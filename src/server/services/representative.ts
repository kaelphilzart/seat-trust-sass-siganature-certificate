import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import {
  IRepresentative,
  ICreateRepresentative,
  IUpdateRepresentative,
} from '@/types/representative';
import { randomUUID } from 'crypto';
import {
  RepresentativeRow,
  RepresentativeOrgRow,
} from '../interfaces/Representative.interface';
import { mapRepresentative } from '../mappers/Representative.mapper';
import { getAuthUser } from '../helpers/auth';

const CACHE_ALL_REPRESENTATIVES = 'representative:all';

// GET
export const getAllRepresentatives = async (): Promise<IRepresentative[]> => {
  const user = await getAuthUser();

  if (!user.organization_id) {
    throw new Error('organization_id is required');
  }

  const organizationId = user.organization_id;

  const cacheKey = `${CACHE_ALL_REPRESENTATIVES}:${organizationId}`;

  const cached = await redis.get<IRepresentative[]>(cacheKey);
  if (cached) return cached;

  const [rows] = await pool.query<RepresentativeRow[]>(
    `
        SELECT 
          r.id,
          r.name,
          r.title,
          r.organization_id,
          r.created_at,
          r.updated_at,

          o.id as org_id,
          o.name as org_name,
          o.slug as org_slug,
          o.logo as org_logo

        FROM representatives r
        LEFT JOIN organizations o
          ON o.id = r.organization_id
        WHERE r.organization_id = ?
        ORDER BY r.created_at DESC
        `,
    [organizationId]
  );

  const representatives = rows.map(mapRepresentative);

  await redis.set(cacheKey, representatives, { ex: 60 });

  return representatives;
};

// GET BY ID
export const getRepresentativeById = async (
  id: string
): Promise<IRepresentative | null> => {
  if (!id) {
    throw new Error('Representative ID is required');
  }

  const [rows] = await pool.query<RepresentativeRow[]>(
    `
        SELECT 
          r.id,
          r.name,
          r.title,
          r.organization_id,
          r.created_at,
          r.updated_at,

          o.id as org_id,
          o.name as org_name,
          o.slug as org_slug,
          o.logo as org_logo

        FROM representatives r
        LEFT JOIN organizations o
          ON o.id = r.organization_id
        WHERE r.id = ?
        LIMIT 1
        `,
    [id]
  );

  const row = rows[0];
  if (!row) return null;

  return mapRepresentative(row);
};

// ===============================
// (POST)
// ===============================
export const createRepresentative = async (
  data: ICreateRepresentative
): Promise<IRepresentative> => {
  const user = await getAuthUser();

  // 🔥 resolve organization_id (user > payload)
  const organizationId = user.organization_id ?? data.organization_id;

  if (!organizationId) {
    throw new Error('organization_id is required');
  }

  const id = randomUUID();

  await pool.query(
    `
        INSERT INTO representatives
        (id, organization_id, name, title)
        VALUES (?, ?, ?, ?)
        `,
    [id, organizationId, data.name, data.title]
  );

  // 🔥 cache invalidation
  await redis.del(CACHE_ALL_REPRESENTATIVES);
  await redis.del(`${CACHE_ALL_REPRESENTATIVES}:${organizationId}`);

  // 🔥 return sesuai contract FE
  return {
    id,
    name: data.name,
    title: data.title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    organization: null,
  };
};

// ===============================
// (PATCH)
// ===============================
export const updateRepresentative = async (
  id: string,
  data: Partial<IUpdateRepresentative>
): Promise<IRepresentative | null> => {
  if (!id) {
    throw new Error('Representative ID is required');
  }

  const allowedFields: (keyof IUpdateRepresentative)[] = ['name', 'title'];

  const fields = Object.keys(data).filter((key) =>
    allowedFields.includes(key as keyof IUpdateRepresentative)
  );

  if (!fields.length) {
    return getRepresentativeById(id);
  }

  const values = fields.map(
    (field) => data[field as keyof IUpdateRepresentative]
  );

  const setClause = fields.map((field) => `${field} = ?`).join(', ');

  const user = await getAuthUser();

  // 🔥 OPTIONAL SCOPING (user → scoped, superadmin → bebas)
  const query = user.organization_id
    ? `UPDATE representatives 
           SET ${setClause}, updated_at = NOW() 
           WHERE id = ? AND organization_id = ?`
    : `UPDATE representatives 
           SET ${setClause}, updated_at = NOW() 
           WHERE id = ?`;

  const params = user.organization_id
    ? [...values, id, user.organization_id]
    : [...values, id];

  await pool.query(query, params);

  // 🔥 CACHE INVALIDATION (tetap aman)
  await redis.del(CACHE_ALL_REPRESENTATIVES);

  if (user.organization_id) {
    await redis.del(`${CACHE_ALL_REPRESENTATIVES}:${user.organization_id}`);
  }

  return getRepresentativeById(id);
};

// ===============================
// DELETE
// ===============================
export const deleteRepresentative = async (id: string): Promise<void> => {
  const [rows] = await pool.query<RepresentativeOrgRow[]>(
    'SELECT organization_id FROM representatives WHERE id = ?',
    [id]
  );

  const organizationId = rows?.[0]?.organization_id;
  await pool.query('DELETE FROM representatives WHERE id = ?', [id]);
  await redis.del(CACHE_ALL_REPRESENTATIVES);
  if (organizationId) {
    await redis.del(`${CACHE_ALL_REPRESENTATIVES}:${organizationId}`);
  }
};
