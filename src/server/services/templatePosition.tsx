import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { ITemplatePosition, ICreateTemplatePosition, IUpdateTemplatePosition } from '@/types/template-position';
import { randomUUID } from 'crypto';
import { RowDataPacket } from "mysql2";

const CACHE_ALL_TEMPLATE_POSITIONS = 'template_positions:all';

// GET
export const getAllTemplatePositions = async (
    batch_id?: string
): Promise<ITemplatePosition[]> => {
    const cacheKey = batch_id
        ? `${CACHE_ALL_TEMPLATE_POSITIONS}:${batch_id}`
        : CACHE_ALL_TEMPLATE_POSITIONS;

    const cached = await redis.get<ITemplatePosition[]>(cacheKey);
    if (cached) return cached;

    const conditions: string[] = [];
    const values: any[] = [];

    if (batch_id) {
        conditions.push("tp.batch_id = ?");
        values.push(batch_id);
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const [rows] = await pool.query(
        `
  SELECT 
      tp.id,
      tp.batch_id,
      tp.element_type_id,
      tp.x,
      tp.y,
      tp.width,
      tp.height,
      tp.rotation,
      tp.font_size,
      tp.font_weight,
      tp.created_at,
      tp.updated_at,

      -- 🔥 element type
      et.id as et_id,
      et.code as et_code,
      et.name as et_name,
      et.ui_type as et_ui_type,
      et.icon_path as et_icon_path,
      et.default_width as et_default_width,
      et.default_height as et_default_height,

      -- asset
      a.id as asset_id,
      a.name as asset_name,
      a.type as asset_type,
      a.file_path as asset_file_path,

      -- org
      o.id as org_id,
      o.name as org_name,
      o.slug as org_slug,
      o.logo as org_logo

  FROM template_positions tp
  LEFT JOIN element_types et ON et.id = tp.element_type_id
  LEFT JOIN organization_assets a ON a.id = tp.asset_id
  LEFT JOIN organizations o ON o.id = a.organization_id

  ${whereClause}
  ORDER BY tp.created_at DESC
  `,
        values
    );

    const templatePositions: ITemplatePosition[] = (rows as any[]).map((row) => ({
        id: row.id,
        batch_id: row.batch_id,
        element_type_id: row.element_type_id,
        x: row.x,
        y: row.y,
        width: row.width,
        height: row.height,
        rotation: row.rotation,
        font_size: row.font_size,
        font_weight: row.font_weight,
        created_at: row.created_at,
        updated_at: row.updated_at,

        // 🔥 NEW: element_type
        element_type: row.et_id
            ? {
                id: row.et_id,
                code: row.et_code,
                name: row.et_name,
                ui_type: row.et_ui_type,
                icon_path: row.et_icon_path,
                default_width: row.et_default_width,
                default_height: row.et_default_height,
            }
            : undefined,

        asset: row.asset_id
            ? {
                id: row.asset_id,
                name: row.asset_name,
                type: row.asset_type,
                file_path: row.asset_file_path,
                organization: row.org_id
                    ? {
                        id: row.org_id,
                        name: row.org_name,
                        slug: row.org_slug,
                        logo: row.org_logo,
                    }
                    : undefined,
            }
            : undefined,
    }));

    await redis.set(cacheKey, templatePositions, { ex: 60 });

    return templatePositions;
};


// GET BY ID
export const getTemplatePositionById = async (
    id: string
): Promise<ITemplatePosition | null> => {
    if (!id) {
        throw new Error("Template position ID is required");
    }

    const [rows] = await pool.query(
        `
        SELECT 
            tp.id,
            tp.batch_id,
            tp.element_type_id,
            tp.x,
            tp.y,
            tp.width,
            tp.height,
            tp.rotation,
            tp.font_size,
            tp.font_weight,
            tp.created_at,
            tp.updated_at,

            a.id as asset_id,
            a.name as asset_name,
            a.type as asset_type,
            a.file_path as asset_file_path,

            o.id as org_id,
            o.name as org_name,
            o.slug as org_slug,
            o.logo as org_logo

        FROM template_positions tp
        LEFT JOIN organization_assets a 
            ON a.id = tp.asset_id

        LEFT JOIN organizations o 
            ON o.id = a.organization_id

        WHERE tp.id = ?
        LIMIT 1
        `,
        [id]
    );

    const row = (rows as any[])[0];
    if (!row) return null;

    return {
        id: row.id,
        batch_id: row.batch_id,
        element_type_id: row.element_type_id,
        x: row.x,
        y: row.y,
        width: row.width,
        height: row.height,
        rotation: row.rotation,
        font_size: row.font_size,
        font_weight: row.font_weight,
        created_at: row.created_at,
        updated_at: row.updated_at,

        asset: row.asset_id
            ? {
                id: row.asset_id,
                name: row.asset_name,
                type: row.asset_type,
                file_path: row.asset_file_path,
                organization: row.org_id
                    ? {
                        id: row.org_id,
                        name: row.org_name,
                        slug: row.org_slug,
                        logo: row.org_logo,
                    }
                    : undefined,
            }
            : undefined, // ⬅️ penting
    };
};

// ===============================
// (POST)
// ===============================
export const createTemplatePositionsBulk = async (
    data: ICreateTemplatePosition[]
): Promise<boolean> => {
    if (!data.length) return false;

    const values = data.map((item) => [
        randomUUID(),
        item.batch_id,
        item.element_type_id,
        item.x,
        item.y,
        item.width,
        item.height,
        item.rotation,
        item.asset_id,
        item.font_size,
        item.font_weight,
    ]);

    await pool.query(
        `
    INSERT INTO template_positions 
    (id, batch_id, element_type_id, x, y, width, height, rotation, asset_id, font_size, font_weight)
    VALUES ?
    `,
        [values]
    );

    // 🔥 clear cache sekali aja
    const batchId = data[0].batch_id;
    await redis.del(CACHE_ALL_TEMPLATE_POSITIONS);
    await redis.del(`${CACHE_ALL_TEMPLATE_POSITIONS}:${batchId}`);

    return true;
};


// ===============================
// (PATCH)
// ===============================
export const updateTemplatePositionsBulk = async (
    data: (IUpdateTemplatePosition & { id: string })[]
): Promise<boolean> => {
    if (!data.length) return false;

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        for (const {
            id, x, y, width, height, rotation,
            asset_id, font_size, font_weight
        } of data) {
            await conn.query(
                `UPDATE template_positions 
         SET x=?, y=?, width=?, height=?, rotation=?, asset_id=?, font_size=?, font_weight=?, updated_at=NOW()
         WHERE id=?`,
                [x, y, width, height, rotation, asset_id ?? null, font_size ?? null, font_weight ?? null, id]
            );
        }

        await conn.commit();

        const batchId = data[0]?.batch_id;
        await redis.del(CACHE_ALL_TEMPLATE_POSITIONS);
        if (batchId) await redis.del(`${CACHE_ALL_TEMPLATE_POSITIONS}:${batchId}`);

        return true;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

// ===============================
// UPSERT (POST + PATCH)
// ===============================

export const upsertTemplatePositionsBulk = async (
    data: (ICreateTemplatePosition & { id?: string })[]
): Promise<boolean> => {
    if (!data.length) return false;

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const batchId = data[0].batch_id;

        // =========================
        // 1. GET EXISTING DATA (DB STATE)
        // =========================
        const [existingRows] = await conn.query<RowDataPacket[]>(
            `SELECT id FROM template_positions WHERE batch_id = ?`,
            [batchId]
        );

        const existingIds = new Set(existingRows.map((r: any) => r.id));

        // =========================
        // 2. BUILD INCOMING IDS
        // =========================
        const incomingIds = new Set<string>();

        const values = data.map((item) => {
            const id = item.id ?? randomUUID();
            incomingIds.add(id);

            return [
                id,
                item.batch_id,
                item.element_type_id,
                item.x,
                item.y,
                item.width,
                item.height,
                item.rotation ?? 0,
                item.asset_id ?? null,
                item.font_size ?? null,
                item.font_weight ?? null,
            ];
        });

        // =========================
        // 3. UPSERT (CREATE + UPDATE)
        // =========================
        await conn.query(
            `
      INSERT INTO template_positions 
      (
        id,
        batch_id,
        element_type_id,
        x,
        y,
        width,
        height,
        rotation,
        asset_id,
        font_size,
        font_weight
      )
      VALUES ?
      ON DUPLICATE KEY UPDATE
        x = VALUES(x),
        y = VALUES(y),
        width = VALUES(width),
        height = VALUES(height),
        rotation = VALUES(rotation),
        asset_id = VALUES(asset_id),
        font_size = VALUES(font_size),
        font_weight = VALUES(font_weight),
        updated_at = NOW()
      `,
            [values]
        );

        // =========================
        // 4. DELETE MISSING (FULL SYNC MAGIC)
        // =========================
        const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));

        if (toDelete.length) {
            await conn.query(
                `DELETE FROM template_positions WHERE id IN (?)`,
                [toDelete]
            );
        }

        // =========================
        // 5. CACHE INVALIDATION
        // =========================
        await redis.del(CACHE_ALL_TEMPLATE_POSITIONS);

        if (batchId) {
            await redis.del(`${CACHE_ALL_TEMPLATE_POSITIONS}:${batchId}`);
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


// ===============================
// DELETE
// ===============================
export const deleteTemplatePosition = async (id: string): Promise<void> => {
    await pool.query('DELETE FROM template_positions WHERE id = ?', [id]);
    await redis.del(CACHE_ALL_TEMPLATE_POSITIONS);
};