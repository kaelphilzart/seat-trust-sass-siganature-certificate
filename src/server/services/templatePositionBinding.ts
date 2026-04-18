import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { ITemplatePositionBinding, ICreateTemplatePositionBinding } from '@/types/template-position-binding';
import { randomUUID } from 'crypto';
import { RowDataPacket } from "mysql2";

const CACHE_ALL_TEMPLATE_POSITION_BINDINGS = 'template_position_bindings:all';

export const getAllTemplatePositionBindings = async (
    batch_id?: string
): Promise<ITemplatePositionBinding[]> => {
    const cacheKey = batch_id
        ? `${CACHE_ALL_TEMPLATE_POSITION_BINDINGS}:${batch_id}`
        : CACHE_ALL_TEMPLATE_POSITION_BINDINGS;

    const cached = await redis.get<ITemplatePositionBinding[]>(cacheKey);
    if (cached) return cached;

    const conditions: string[] = [];
    const values: any[] = [];

    // =========================
    // FIX UTAMA: SCOPING BY BATCH
    // =========================
    if (batch_id) {
        conditions.push('tpb.batch_id = ?');
        values.push(batch_id);
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    const [rows] = await pool.query<RowDataPacket[]>(
        `
        SELECT 
          tpb.id,
          tpb.batch_id,
          tp.id AS template_position_id,
          tp.batch_id AS template_batch_id,

          br.id AS batch_representative_id,

          b.id AS batch_id,
          b.name AS batch_name,

          r.id AS representative_id,
          r.name AS representative_name,
          r.title AS representative_title,

          tpb.created_at,
          tpb.updated_at

        FROM template_position_bindings tpb
        LEFT JOIN template_positions tp ON tp.id = tpb.template_position_id
        LEFT JOIN batch_representatives br ON br.id = tpb.batch_representative_id
        LEFT JOIN batches b ON b.id = br.batch_id
        LEFT JOIN representatives r ON r.id = br.representative_id

        ${whereClause}
        ORDER BY tpb.created_at DESC
        `,
        values
    );

    const templatePositionBindings: ITemplatePositionBinding[] = rows.map((row: any) => ({
        id: row.id,
        batch_id: row.batch_id,
        templatePosition: row.template_position_id
            ? {
                id: row.template_position_id,
                batch_id: row.template_batch_id,
            }
            : null,

        batchRepresentative: row.batch_representative_id
            ? {
                id: row.batch_representative_id,
                batch: row.batch_id
                    ? {
                        id: row.batch_id,
                        name: row.batch_name,
                    }
                    : null,
                representative: row.representative_id
                    ? {
                        id: row.representative_id,
                        name: row.representative_name,
                        title: row.representative_title,
                    }
                    : null,
                created_at: row.created_at,
                updated_at: row.updated_at,
            }
            : null,

        created_at: row.created_at,
        updated_at: row.updated_at,
    }));

    await redis.set(cacheKey, templatePositionBindings, { ex: 60 });

    return templatePositionBindings;
};


// GET BY ID
export const getTemplatePositionBindingById = async (
    id: string
): Promise<ITemplatePositionBinding | null> => {
    if (!id) {
        throw new Error('Template position binding ID is required');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
        `
    SELECT 
      tpb.id,

      -- template position
      tp.id AS template_position_id,
      tp.batch_id AS template_batch_id,

      -- batch representative
      br.id AS batch_representative_id,

      -- batch
      b.id AS batch_id,
      b.name AS batch_name,

      -- representative
      r.id AS representative_id,
      r.name AS representative_name,
      r.title AS representative_title,

      tpb.created_at,
      tpb.updated_at

    FROM template_position_bindings tpb
    LEFT JOIN template_positions tp ON tp.id = tpb.template_position_id
    LEFT JOIN batch_representatives br ON br.id = tpb.batch_representative_id
    LEFT JOIN batches b ON b.id = br.batch_id
    LEFT JOIN representatives r ON r.id = br.representative_id

    WHERE tpb.id = ?
    LIMIT 1
    `,
        [id]
    );

    const row = rows[0];
    if (!row) return null;

    return {
        id: row.id,

        templatePosition: row.template_position_id
            ? {
                id: row.template_position_id,
                batch_id: row.template_batch_id,
            }
            : null,

        batchRepresentative: row.batch_representative_id
            ? {
                id: row.batch_representative_id,
                batch: row.batch_id
                    ? {
                        id: row.batch_id,
                        name: row.batch_name,
                    }
                    : null,
                representative: row.representative_id
                    ? {
                        id: row.representative_id,
                        name: row.representative_name,
                        title: row.representative_title,
                    }
                    : null,
                created_at: row.created_at,
                updated_at: row.updated_at,
            }
            : null,

        created_at: row.created_at,
        updated_at: row.updated_at,
    };
};


// CREATE
export const upsertTemplatePositionBindingsBulk = async (
    data: ICreateTemplatePositionBinding[]
): Promise<boolean> => {
    if (!data.length) return false;

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const batchId = data[0].batch_id;

        // =========================
        // 1. FETCH EXISTING
        // =========================
        const [existingRows] = await conn.query<RowDataPacket[]>(
            `
            SELECT id, template_position_id, batch_representative_id
            FROM template_position_bindings
            WHERE batch_id = ?
            `,
            [batchId]
        );

        const existingMap = new Map<string, string>();

        for (const row of existingRows as any[]) {
            const key = `${row.template_position_id}-${row.batch_representative_id}`;
            existingMap.set(key, row.id);
        }

        // =========================
        // 2. BUILD INCOMING STATE
        // =========================
        const incomingSet = new Set<string>();

        for (const item of data) {
            const key = `${item.template_position_id}-${item.batch_representative_id}`;
            incomingSet.add(key);
        }

        // =========================
        // 3. INSERT NEW ONLY (WITH UUID FIX)
        // =========================
        const insertValues: any[] = [];

        for (const item of data) {
            const key = `${item.template_position_id}-${item.batch_representative_id}`;

            if (!existingMap.has(key)) {
                insertValues.push([
                    randomUUID(), // 🔥 FIX PRIMARY KEY
                    batchId,
                    item.template_position_id,
                    item.batch_representative_id,
                ]);
            }
        }

        if (insertValues.length) {
            await conn.query(
                `
                INSERT INTO template_position_bindings
                (id, batch_id, template_position_id, batch_representative_id)
                VALUES ?
                `,
                [insertValues]
            );
        }

        // =========================
        // 4. DELETE MISSING
        // =========================
        const toDelete = existingRows
            .filter((row: any) => {
                const key = `${row.template_position_id}-${row.batch_representative_id}`;
                return !incomingSet.has(key);
            })
            .map((row: any) => row.id);

        if (toDelete.length) {
            await conn.query(
                `
                DELETE FROM template_position_bindings
                WHERE id IN (?)
                `,
                [toDelete]
            );
        }

        // =========================
        // 5. CACHE INVALIDATION
        // =========================
        await redis.del(CACHE_ALL_TEMPLATE_POSITION_BINDINGS);
        await redis.del(`${CACHE_ALL_TEMPLATE_POSITION_BINDINGS}:${batchId}`);

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
export const deleteTemplatePositionBindingsBulk = async (
    ids: string[]
): Promise<boolean> => {
    if (!ids.length) return false;

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // =========================
        // 1. GET template_position_id (buat cache invalidation)
        // =========================
        const [rows] = await conn.query<RowDataPacket[]>(
            `
      SELECT DISTINCT template_position_id 
      FROM template_position_bindings
      WHERE id IN (?)
      `,
            [ids]
        );

        const templatePositionIds = rows.map(
            (r: any) => r.template_position_id
        );

        // =========================
        // 2. DELETE
        // =========================
        await conn.query(
            `DELETE FROM template_position_bindings WHERE id IN (?)`,
            [ids]
        );

        // =========================
        // 3. CACHE INVALIDATION 🔥
        // =========================
        await redis.del(CACHE_ALL_TEMPLATE_POSITION_BINDINGS);

        for (const templatePositionId of templatePositionIds) {
            await redis.del(
                `${CACHE_ALL_TEMPLATE_POSITION_BINDINGS}:${templatePositionId}`
            );
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




