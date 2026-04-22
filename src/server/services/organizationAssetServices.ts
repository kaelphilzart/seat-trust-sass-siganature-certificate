import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import {
  ICreateOrganizationAsset,
  IUpdateOrganizationAsset,
} from '@/types/organization';
import { randomUUID } from 'crypto';
import { mapOrganizationAsset } from '../mappers/OrganizationAsset.mapper';
import {
  OrganizationAssetRow,
  OrganizationAssetOrgRow,
} from '../interfaces/OrganizationAsset.interface';

const CACHE_ALL_ORGANIZATION_ASSETS = 'organizations_assets:all';

// GET
export const getAllOrganizationsAssets = async (organization_id?: string) => {
  const cacheKey = organization_id
    ? `${CACHE_ALL_ORGANIZATION_ASSETS}:${organization_id}`
    : CACHE_ALL_ORGANIZATION_ASSETS;

  const cached = await redis.get(cacheKey);
  if (cached) return cached;

  const conditions: string[] = [];
  const values: string[] = [];

  if (organization_id) {
    conditions.push('oa.organization_id = ?');
    values.push(organization_id);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const [rows] = await pool.query<OrganizationAssetRow[]>(
    `
        SELECT 
          oa.id,
          oa.name,
          oa.type,
          oa.file_path,
          oa.created_at,
          oa.updated_at,

          o.id as org_id,
          o.name as org_name

        FROM organization_assets oa
        LEFT JOIN organizations o 
          ON o.id = oa.organization_id

        ${whereClause}
        ORDER BY oa.created_at DESC
        `,
    values
  );

  const assets = rows.map(mapOrganizationAsset);
  await redis.set(cacheKey, assets, { ex: 60 });

  return assets;
};

// GET BY ID
export const getOrganizationAssetById = async (id: string) => {
  const [rows] = await pool.query<OrganizationAssetRow[]>(
    `
        SELECT 
            oa.id,
            oa.name,
            oa.type,
            oa.file_path,
            oa.created_at,
            oa.updated_at,

            o.id as org_id,
            o.name as org_name

        FROM organization_assets oa
        LEFT JOIN organizations o 
            ON o.id = oa.organization_id
        WHERE oa.id = ?
        LIMIT 1
        `,
    [id]
  );

  const row = rows[0];
  if (!row) return null;

  return mapOrganizationAsset(row);
};

// ===============================
// (POST)
// ===============================
export const createOrganizationAsset = async (
  data: ICreateOrganizationAsset
) => {
  const id = randomUUID();

  await pool.query(
    `
        INSERT INTO organization_assets
        (id, organization_id, name, type, file_path)
        VALUES (?, ?, ?, ?, ?)
        `,
    [id, data.organization_id, data.name, data.type, data.file_path]
  );

  // invalidate cache
  await redis.del(CACHE_ALL_ORGANIZATION_ASSETS);
  await redis.del(`${CACHE_ALL_ORGANIZATION_ASSETS}:${data.organization_id}`);

  return await getOrganizationAssetById(id);
};

// ===============================
// (PATCH)
// ===============================
export const updateOrganizationAsset = async (
  id: string,
  data: Partial<IUpdateOrganizationAsset>
) => {
  const allowedFields = ['name', 'type', 'file_path'];

  const fields = Object.keys(data).filter((key) => allowedFields.includes(key));

  if (!fields.length) {
    const [rows] = await pool.query<OrganizationAssetRow[]>(
      `SELECT * FROM organization_assets WHERE id = ?`,
      [id]
    );

    const row = rows[0];
    return row ?? null;
  }

  const values = fields.map(
    (field) => data[field as keyof IUpdateOrganizationAsset]
  );

  const setClause = fields.map((field) => `${field} = ?`).join(', ');

  await pool.query(
    `
        UPDATE organization_assets 
        SET ${setClause}, updated_at = NOW() 
        WHERE id = ?
        `,
    [...values, id]
  );

  const [rows] = await pool.query<OrganizationAssetOrgRow[]>(
    `SELECT organization_id FROM organization_assets WHERE id = ?`,
    [id]
  );

  const organizationId = rows[0]?.organization_id;

  // cache invalidation
  await redis.del(CACHE_ALL_ORGANIZATION_ASSETS);

  if (organizationId) {
    await redis.del(`${CACHE_ALL_ORGANIZATION_ASSETS}:${organizationId}`);
  }
  return getOrganizationAssetById(id);
};
// ===============================
// DELETE
// ===============================
export const deleteOrganizationAsset = async (id: string): Promise<void> => {
  const [rows] = await pool.query<OrganizationAssetOrgRow[]>(
    'SELECT organization_id FROM organization_assets WHERE id = ?',
    [id]
  );
  const organizationId = rows?.[0]?.organization_id;
  await pool.query('DELETE FROM organization_assets WHERE id = ?', [id]);
  await redis.del(CACHE_ALL_ORGANIZATION_ASSETS);
  if (organizationId) {
    await redis.del(`${CACHE_ALL_ORGANIZATION_ASSETS}:${organizationId}`);
  }
};
