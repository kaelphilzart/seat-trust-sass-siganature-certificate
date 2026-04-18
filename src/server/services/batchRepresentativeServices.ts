import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { IBatchRepresentative, ICreateBatchRepresentative} from "@/types/batch-representative";
import { ICreateRepresentative } from '@/types/representative';
import { randomUUID } from 'crypto';
import { RowDataPacket } from "mysql2";
// import { getAuthUser } from "@/server/helpers/auth";


const CACHE_ALL_BATCH_REPRESENTATIVES = 'batch_representatives:all';

export const getAllBatchRepresentatives = async (
    batch_id?: string
): Promise<IBatchRepresentative[]> => {
    const cacheKey = batch_id
        ? `${CACHE_ALL_BATCH_REPRESENTATIVES}:${batch_id}`
        : CACHE_ALL_BATCH_REPRESENTATIVES;

    const cached = await redis.get<IBatchRepresentative[]>(cacheKey);
    if (cached) return cached;

    const conditions: string[] = [];
    const values: any[] = [];

    if (batch_id) {
        conditions.push('br.batch_id = ?');
        values.push(batch_id);
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    const [rows] = await pool.query<RowDataPacket[]>(
        `
    SELECT 
      br.id,

      b.id AS batch_id,
      b.name AS batch_name,
      b.start_date,
      b.end_date,

      r.id AS representative_id,
      r.name AS representative_name,
      r.title AS representative_title,

      br.created_at,
      br.updated_at

    FROM batch_representatives br
    LEFT JOIN batches b ON b.id = br.batch_id
    LEFT JOIN representatives r ON r.id = br.representative_id

    ${whereClause}
    ORDER BY br.created_at DESC
    `,
        values
    );

    const batchRepresentatives: IBatchRepresentative[] = rows.map((row: any) => ({
        id: row.id,
        batch: {
            id: row.batch_id,
            name: row.batch_name,
            start_date: row.start_date,
            end_date: row.end_date,
        },
        representative: row.representative_id
            ? {
                id: row.representative_id,
                name: row.representative_name,
                title: row.representative_title,
            }
            : null,
        created_at: row.created_at,
        updated_at: row.updated_at,
    }));

    await redis.set(cacheKey, batchRepresentatives, { ex: 60 });

    return batchRepresentatives;
};


// GET BY ID
export const getBatchRepresentativeById = async (
    id: string
): Promise<IBatchRepresentative | null> => {
    if (!id) {
        throw new Error('Batch representative ID is required');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
        `
    SELECT 
      br.id,

      -- batch
      b.id AS batch_id,
      b.name AS batch_name,
      b.start_date,
      b.end_date,

      -- representative
      r.id AS representative_id,
      r.name AS representative_name,
      r.title AS representative_title,

      br.created_at,
      br.updated_at

    FROM batch_representatives br
    LEFT JOIN batches b ON b.id = br.batch_id
    LEFT JOIN representatives r ON r.id = br.representative_id

    WHERE br.id = ?
    LIMIT 1
    `,
        [id]
    );

    const row = rows[0];
    if (!row) return null;

    return {
        id: row.id,

        batch: {
            id: row.batch_id,
            name: row.batch_name,
            start_date: row.start_date,
            end_date: row.end_date,
        },

        representative: row.representative_id
            ? {
                id: row.representative_id,
                name: row.representative_name,
                title: row.representative_title,
            }
            : null,

        created_at: row.created_at,
        updated_at: row.updated_at,
    };
};


// CREATE
export const upsertBatchRepresentativesBulk = async (
    data: ICreateBatchRepresentative[]
): Promise<boolean> => {
    if (!data.length) return false;

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const batchId = data[0].batch_id;

        // =========================
        // 1. GET EXISTING
        // =========================
        const [existingRows] = await conn.query<RowDataPacket[]>(
            `SELECT id, representative_id FROM batch_representatives WHERE batch_id = ?`,
            [batchId]
        );

        const existingMap = new Map<string, string>();
        // representative_id -> id

        existingRows.forEach((row: any) => {
            existingMap.set(row.representative_id, row.id);
        });

        // =========================
        // 2. BUILD INCOMING
        // =========================
        const incomingSet = new Set<string>();
        const values: any[] = [];

        data.forEach((item) => {
            const existingId = existingMap.get(item.representative_id);

            const id = existingId ?? randomUUID();

            incomingSet.add(item.representative_id);

            values.push([
                id,
                item.batch_id,
                item.representative_id,
            ]);
        });

        // =========================
        // 3. INSERT (NO UPDATE NEEDED)
        // =========================
        if (values.length) {
            await conn.query(
                `
        INSERT INTO batch_representatives (id, batch_id, representative_id)
        VALUES ?
        ON DUPLICATE KEY UPDATE
          representative_id = VALUES(representative_id)
        `,
                [values]
            );
        }

        // =========================
        // 4. DELETE MISSING
        // =========================
        const toDelete = existingRows
            .filter((row: any) => !incomingSet.has(row.representative_id))
            .map((row: any) => row.id);

        if (toDelete.length) {
            await conn.query(
                `DELETE FROM batch_representatives WHERE id IN (?)`,
                [toDelete]
            );
        }

        // =========================
        // 5. CACHE INVALIDATION 🔥
        // =========================
        await redis.del(CACHE_ALL_BATCH_REPRESENTATIVES);

        if (batchId) {
            await redis.del(`${CACHE_ALL_BATCH_REPRESENTATIVES}:${batchId}`);
        }

        await conn.commit();
        return true;

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

// delete
export const deleteBatchRepresentativesBulk = async (
  ids: string[]
): Promise<boolean> => {
  if (!ids.length) return false;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // =========================
    // 1. GET batch_id (buat cache invalidation)
    // =========================
    const [rows] = await conn.query<RowDataPacket[]>(
      `
      SELECT DISTINCT batch_id 
      FROM batch_representatives
      WHERE id IN (?)
      `,
      [ids]
    );

    const batchIds = rows.map((r: any) => r.batch_id);

    // =========================
    // 2. DELETE
    // =========================
    await conn.query(
      `DELETE FROM batch_representatives WHERE id IN (?)`,
      [ids]
    );

    // =========================
    // 3. CACHE INVALIDATION 🔥
    // =========================
    await redis.del(CACHE_ALL_BATCH_REPRESENTATIVES);

    for (const batchId of batchIds) {
      await redis.del(`${CACHE_ALL_BATCH_REPRESENTATIVES}:${batchId}`);
    }

    await conn.commit();
    return true;

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// export const createBatchRepresentative = async (
//     data: ICreateRepresentative,
//     batch_id?: string
// ): Promise<{ id: string; name: string; title: string }> => {

//     const user = await getAuthUser();

//     // =========================
//     // VALIDATION
//     // =========================
//     // Kalau bukan superadmin & ga punya org → block
//     if (!user.organization_id) {
//         throw new Error("Organization required");
//     }

//     const organization_id = user.organization_id;

//     const conn = await pool.getConnection();

//     try {
//         await conn.beginTransaction();

//         const representative_id = randomUUID();

//         // =========================
//         // 1. INSERT REPRESENTATIVE
//         // =========================
//         await conn.query(
//             `
//             INSERT INTO representatives
//             (id, organization_id, name, title)
//             VALUES (?, ?, ?, ?)
//             `,
//             [
//                 representative_id,
//                 organization_id,
//                 data.name,
//                 data.title
//             ]
//         );

//         // =========================
//         // 2. OPTIONAL: INSERT TO BATCH
//         // =========================
//         if (batch_id) {
//             await conn.query(
//                 `
//                 INSERT INTO batch_representatives
//                 (id, batch_id, representative_id)
//                 VALUES (?, ?, ?)
//                 `,
//                 [
//                     randomUUID(),
//                     batch_id,
//                     representative_id
//                 ]
//             );
//         }

//         await conn.commit();

//         // =========================
//         // 3. CACHE INVALIDATION
//         // =========================
//         await redis.del(CACHE_ALL_BATCH_REPRESENTATIVES);

//         // invalidate per org (user biasa)
//         if (organization_id) {
//             await redis.del(`${CACHE_ALL_BATCH_REPRESENTATIVES}:${organization_id}`);
//         }

//         // invalidate per batch
//         if (batch_id) {
//             await redis.del(`${CACHE_ALL_BATCH_REPRESENTATIVES}:${batch_id}`);
//         }

//         return {
//             id: representative_id,
//             name: data.name,
//             title: data.title,
//         };

//     } catch (err) {
//         await conn.rollback();
//         throw err;
//     } finally {
//         conn.release();
//     }
// };






