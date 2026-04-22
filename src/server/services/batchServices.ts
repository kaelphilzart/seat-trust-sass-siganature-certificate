import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { ICreateBatch, IUpdateBatch } from '@/types/batch';
import { randomUUID } from 'crypto';
import { BatchRow, BatchOrgRow } from '../interfaces/Batch.interface';
import { mapBatch } from '../mappers/Batch.mapper';

const CACHE_ALL_BATCH = 'batch:all';

// GET
export const getAllBatch = async (organization_id?: string) => {
  const cacheKey = organization_id
    ? `${CACHE_ALL_BATCH}:${organization_id}`
    : CACHE_ALL_BATCH;

  // =========================
  // CACHE
  // =========================
  const cached = await redis.get(cacheKey);
  if (cached) return cached;

  // =========================
  // WHERE
  // =========================
  const conditions: string[] = [];
  const values: string[] = [];

  if (organization_id) {
    conditions.push('b.organization_id = ?');
    values.push(organization_id);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  // =========================
  // QUERY
  // =========================
  const [rows] = await pool.query<BatchRow[]>(
    `
        SELECT 
            b.id,
            b.name,
            b.organization_id,
            b.template_id,
            b.start_date,
            b.end_date,
            b.status,
            b.created_at,
            b.updated_at,

            t.id AS template_id,
            t.name AS template_name,
            t.file_path AS template_file_path,

            o.id AS org_id,
            o.name AS org_name,
            o.slug AS org_slug,
            o.logo AS org_logo,

            COUNT(p.id) AS participants_count

        FROM batches b
        LEFT JOIN templates t ON t.id = b.template_id
        LEFT JOIN organizations o ON o.id = b.organization_id
        LEFT JOIN participants p ON p.batch_id = b.id

        ${whereClause}

        GROUP BY 
            b.id,
            b.name,
            b.organization_id,
            b.template_id,
            b.start_date,
            b.end_date,
            b.status,
            b.created_at,
            b.updated_at,
            t.id,
            t.name,
            t.file_path,
            o.id,
            o.name,
            o.slug,
            o.logo

        ORDER BY b.created_at DESC
        `,
    values
  );

  // =========================
  // MAP
  // =========================
  const batches = rows.map(mapBatch);

  // =========================
  // CACHE
  // =========================
  await redis.set(cacheKey, batches, { ex: 60 });

  return batches;
};

// GET BY ID
export const getBatchById = async (id: string) => {
  if (!id) {
    throw new Error('Batch ID is required');
  }

  const [rows] = await pool.query<BatchRow[]>(
    `
        SELECT 
            b.id,
            b.name,
            b.organization_id,
            b.template_id,
            b.start_date,
            b.end_date,
            b.status,
            b.created_at,
            b.updated_at,

            t.id AS template_id,
            t.name AS template_name,
            t.file_path AS template_file_path,

            o.id AS org_id,
            o.name AS org_name,
            o.slug AS org_slug,
            o.logo AS org_logo

        FROM batches b
        LEFT JOIN templates t ON t.id = b.template_id
        LEFT JOIN organizations o ON o.id = b.organization_id

        WHERE b.id = ?
        LIMIT 1
        `,
    [id]
  );

  const row = rows[0];
  if (!row) return null;

  return mapBatch(row);
};

// ===============================
// (POST)
// ===============================
export const createBatch = async (data: ICreateBatch) => {
  const id = randomUUID();

  await pool.query(
    `
        INSERT INTO batches
        (id, organization_id, template_id, name, start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
    [
      id,
      data.organization_id,
      data.template_id,
      data.name,
      data.start_date,
      data.end_date,
      data.status,
    ]
  );

  // =========================
  // CACHE INVALIDATION
  // =========================
  await redis.del(CACHE_ALL_BATCH);
  await redis.del(`${CACHE_ALL_BATCH}:${data.organization_id}`);

  // =========================
  // RETURN SINGLE SOURCE OF TRUTH
  // =========================
  return getBatchById(id);
};

// ===============================
// (PATCH)
// ===============================
export const updateBatch = async (id: string, data: Partial<IUpdateBatch>) => {
  const allowedFields = [
    'name',
    'template_id',
    'start_date',
    'end_date',
    'status',
  ];

  const fields = Object.keys(data).filter((key) => allowedFields.includes(key));

  if (!fields.length) {
    return getBatchById(id);
  }

  // =========================
  // BUILD UPDATE VALUES
  // =========================
  const values = fields.map(
    (field) => (data as Record<string, unknown>)[field]
  );

  const setClause = fields.map((field) => `${field} = ?`).join(', ');

  await pool.query(
    `
        UPDATE batches 
        SET ${setClause}, updated_at = NOW() 
        WHERE id = ?
        `,
    [...values, id]
  );

  // =========================
  // GET ORGANIZATION ID (NO ANY)
  // =========================
  const [rows] = await pool.query<BatchOrgRow[]>(
    `
        SELECT organization_id 
        FROM batches 
        WHERE id = ?
        `,
    [id]
  );

  const organizationId = rows[0]?.organization_id;

  // =========================
  // CACHE INVALIDATION
  // =========================
  await redis.del(CACHE_ALL_BATCH);

  if (organizationId) {
    await redis.del(`${CACHE_ALL_BATCH}:${organizationId}`);
  }

  return getBatchById(id);
};

// ===============================
// DELETE
// ===============================
export const deleteBatch = async (id: string): Promise<void> => {
  // ambil organization_id dulu SEBELUM delete
  const [rows] = await pool.query<BatchOrgRow[]>(
    'SELECT organization_id FROM batches WHERE id = ?',
    [id]
  );

  const organizationId = rows?.[0]?.organization_id;

  // delete data
  await pool.query('DELETE FROM batches WHERE id = ?', [id]);

  // 🔥 clear cache global
  await redis.del(CACHE_ALL_BATCH);

  // 🔥 clear cache per organization (INI YANG KURANG)
  if (organizationId) {
    await redis.del(`${CACHE_ALL_BATCH}:${organizationId}`);
  }
};
