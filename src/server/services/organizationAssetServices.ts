import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { IOrganizationAsset, ICreateOrganizationAsset, IUpdateOrganizationAsset } from '@/types/organization';
import { randomUUID } from 'crypto';

const CACHE_ALL_ORGANIZATION_ASSETS = 'organizations_assets:all';

// GET
export const getAllOrganizationsAssets = async (
    organization_id?: string
): Promise<IOrganizationAsset[]> => {
    const cacheKey = organization_id
        ? `${CACHE_ALL_ORGANIZATION_ASSETS}:${organization_id}`
        : CACHE_ALL_ORGANIZATION_ASSETS;

    const cached = await redis.get<IOrganizationAsset[]>(cacheKey);
    if (cached) return cached;

    const conditions: string[] = [];
    const values: any[] = [];

    if (organization_id) {
        conditions.push("oa.organization_id = ?");
        values.push(organization_id);
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const [rows] = await pool.query(
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

    const assets: IOrganizationAsset[] = (rows as any[]).map((row) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        file_path: row.file_path,
        created_at: row.created_at,
        updated_at: row.updated_at,

        organization: row.org_id
            ? {
                id: row.org_id,
                name: row.org_name,
            }
            : undefined,
    }));

    await redis.set(cacheKey, assets, { ex: 60 });

    return assets;
};

// GET BY ID
export const getOrganizationAssetById = async (id: string): Promise<IOrganizationAsset | null> => {
    const [rows] = await pool.query(`
        SELECT 
            oa.*,
            o.id as organization_id,
            o.name as organization_name
        FROM organization_assets oa
        LEFT JOIN organizations o ON o.id = oa.organization_id
        WHERE oa.id = ?
        LIMIT 1
    `, [id]);

    const row = (rows as any[])[0];
    if (!row) return null;

    return {
        id: row.id,
        name: row.name,
        type: row.type,
        file_path: row.file_path,
        created_at: row.created_at,
        updated_at: row.updated_at,
        organization: {
            id: row.organization_id,
            name: row.organization_name,
        }
    };
};


// ===============================
// (POST)
// ===============================
export const createOrganizationAsset = async (
    data: ICreateOrganizationAsset
): Promise<IOrganizationAsset | null> => {
    const id = randomUUID();

    await pool.query(
        `
    INSERT INTO organization_assets
    (id, organization_id, name, type, file_path)
    VALUES (?, ?, ?, ?, ?)
    `,
        [
            id,
            data.organization_id,
            data.name,
            data.type,
            data.file_path
        ]
    );

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
): Promise<IOrganizationAsset | null> => {

  const allowedFields = ['name', 'type', 'file_path'];

  const fields = Object.keys(data).filter((key) =>
    allowedFields.includes(key)
  );
  if (!fields.length) return getOrganizationAssetById(id);

  const values = fields.map((field) => (data as any)[field]);
  const setClause = fields.map((field) => `${field} = ?`).join(', ');
  await pool.query(
    `UPDATE organization_assets 
     SET ${setClause}, updated_at = NOW() 
     WHERE id = ?`,
    [...values, id]
  );

  const [rows]: any = await pool.query(
    `SELECT organization_id FROM organization_assets WHERE id = ?`,
    [id]
  );

  const organizationId = rows?.[0]?.organization_id;

  // ========================
  // CLEAR CACHE
  // ========================
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
  // ambil organization_id dulu SEBELUM delete
  const [rows]: any = await pool.query(
    'SELECT organization_id FROM organization_assets WHERE id = ?',
    [id]
  );

  const organizationId = rows?.[0]?.organization_id;

  // delete data
  await pool.query('DELETE FROM organization_assets WHERE id = ?', [id]);

  // 🔥 clear cache global
  await redis.del(CACHE_ALL_ORGANIZATION_ASSETS);

  // 🔥 clear cache per organization (INI YANG KURANG)
  if (organizationId) {
    await redis.del(`${CACHE_ALL_ORGANIZATION_ASSETS}:${organizationId}`);
  }
};