import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { IBatch, ICreateBatch, IUpdateBatch } from '@/types/batch';
import { randomUUID } from 'crypto';
import { RowDataPacket } from 'mysql2';

const CACHE_ALL_BATCH = 'batch:all';

// GET
export const getAllBatch = async (
    organization_id?: string
): Promise<IBatch[]> => {
    const cacheKey = organization_id
        ? `${CACHE_ALL_BATCH}:${organization_id}`
        : CACHE_ALL_BATCH;

    // =========================
    // CACHE
    // =========================
    const cached = await redis.get<IBatch[]>(cacheKey);
    if (cached) return cached;

    // =========================
    // BUILD WHERE
    // =========================
    const conditions: string[] = [];
    const values: any[] = [];

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
    const [rows] = await pool.query<RowDataPacket[]>(
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
    // MAPPING
    // =========================
    const batches: IBatch[] = (rows as any[]).map((row) => ({
        id: row.id,
        name: row.name,
        organization_id: row.organization_id,
        template_id: row.template_id,
        start_date: row.start_date,
        end_date: row.end_date,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,

        // 🔥 NEW FIELD
        participants_count: Number(row.participants_count) || 0,

        template: row.template_id
            ? {
                id: row.template_id,
                name: row.template_name,
                file_path: row.template_file_path,
            }
            : null,

        organization: row.org_id
            ? {
                id: row.org_id,
                name: row.org_name,
                slug: row.org_slug,
                logo: row.org_logo,
            }
            : null,
    }));

    // =========================
    // CACHE SET
    // =========================
    await redis.set(cacheKey, batches, { ex: 60 });

    return batches;
};

// GET BY ID
export const getBatchById = async (
    id: string
): Promise<IBatch | null> => {
    if (!id) {
        throw new Error("Batch ID is required");
    }

    const [rows] = await pool.query(
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

      t.id as template_id,
      t.name as template_name,
      t.file_path as template_file_path,

      o.id as org_id,
      o.name as org_name,
      o.slug as org_slug,
      o.logo as org_logo

    FROM batches b
    LEFT JOIN templates t ON t.id = b.template_id
    LEFT JOIN organizations o ON o.id = b.organization_id

    WHERE b.id = ?
    LIMIT 1
    `,
        [id]
    );

    const row = (rows as any[])[0];
    if (!row) return null;

    return {
        id: row.id,
        name: row.name,
        start_date: row.start_date,
        end_date: row.end_date,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,

        template: row.template_id
            ? {
                id: row.template_id,
                name: row.template_name,
                file_path: row.template_file_path,
            }
            : null,

        organization: row.org_id
            ? {
                id: row.org_id,
                name: row.org_name,
                slug: row.org_slug,
                logo: row.org_logo,
            }
            : null,
    };
};

// ===============================
// (POST)
// ===============================
export const createBatch = async (
    data: ICreateBatch
): Promise<IBatch | null> => {
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

    await redis.del(CACHE_ALL_BATCH);
    await redis.del(`${CACHE_ALL_BATCH}:${data.organization_id}`);

    return await getBatchById(id);
};

// ===============================
// (PATCH)
// ===============================
export const updateBatch = async (
    id: string,
    data: Partial<IUpdateBatch>
): Promise<IBatch | null> => {
    const allowedFields = ['name', 'template_id', 'start_date', 'end_date', 'status'];

    const fields = Object.keys(data).filter((key) =>
        allowedFields.includes(key)
    );

    if (!fields.length) return getBatchById(id);

    const values = fields.map((field) => (data as any)[field]);
    const setClause = fields.map((field) => `${field} = ?`).join(', ');

    await pool.query(
        `UPDATE batches SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        [...values, id]
    );
    const [rows]: any = await pool.query(
        `SELECT organization_id FROM batches WHERE id = ?`,
        [id]
    );

    const organizationId = rows?.[0]?.organization_id;

    // clear cache
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
    const [rows]: any = await pool.query(
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