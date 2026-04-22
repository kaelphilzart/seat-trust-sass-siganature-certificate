import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { ICreateTemplatePosition } from '@/types/template-position';
import { randomUUID } from 'crypto';
import {
  TemplatePositionRow,
  ExistingTemplatePositionRow,
} from '../interfaces/TemplatePosition.interface';
import { mapTemplatePosition } from '../mappers/TemplatePosition.mapper';

const CACHE_ALL_TEMPLATE_POSITIONS = 'template_positions:all';

// GET
export const getAllTemplatePositions = async (batch_id?: string) => {
  const cacheKey = batch_id
    ? `${CACHE_ALL_TEMPLATE_POSITIONS}:${batch_id}`
    : CACHE_ALL_TEMPLATE_POSITIONS;

  const cached = await redis.get(cacheKey);
  if (cached) return cached;

  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (batch_id) {
    conditions.push('tp.batch_id = ?');
    values.push(batch_id);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const [rows] = await pool.query<TemplatePositionRow[]>(
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

            et.id as et_id,
            et.code as et_code,
            et.name as et_name,
            et.ui_type as et_ui_type,
            et.icon_path as et_icon_path,
            et.default_width as et_default_width,
            et.default_height as et_default_height,

            a.id as asset_id,
            a.name as asset_name,
            a.type as asset_type,
            a.file_path as asset_file_path,

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

  const templatePositions = rows.map(mapTemplatePosition);

  await redis.set(cacheKey, templatePositions, { ex: 60 });

  return templatePositions;
};

// GET BY ID
export const getTemplatePositionById = async (id: string) => {
  if (!id) {
    throw new Error('Template position ID is required');
  }

  const [rows] = await pool.query<TemplatePositionRow[]>(
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

            -- element type
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
        LEFT JOIN element_types et 
            ON et.id = tp.element_type_id
        LEFT JOIN organization_assets a 
            ON a.id = tp.asset_id
        LEFT JOIN organizations o 
            ON o.id = a.organization_id

        WHERE tp.id = ?
        LIMIT 1
        `,
    [id]
  );

  const row = rows[0];
  if (!row) return null;

  return mapTemplatePosition(row);
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

    const batchId = data[0]?.batch_id;
    if (!batchId) throw new Error('batch_id is required');

    // =========================
    // 1. EXISTING
    // =========================
    const [existingRows] = await conn.query<ExistingTemplatePositionRow[]>(
      `SELECT id FROM template_positions WHERE batch_id = ?`,
      [batchId]
    );

    const existingIds = new Set(existingRows.map((r) => r.id));

    // =========================
    // 2. NORMALIZE INPUT (KEEP INTERFACE)
    // =========================
    const incomingIds = new Set<string>();

    const values = data.map((item) => {
      const id = item.id ?? randomUUID();
      incomingIds.add(id);

      return {
        id,
        batch_id: item.batch_id,
        element_type_id: item.element_type_id ?? null,
        x: item.x ?? null,
        y: item.y ?? null,
        width: item.width ?? null,
        height: item.height ?? null,
        rotation: item.rotation ?? 0,
        asset_id: item.asset_id ?? null,
        font_size: item.font_size ?? null,
        font_weight: item.font_weight ?? null,
      };
    });

    // =========================
    // 3. FLATTEN TO SQL (NO TUPLE TYPE)
    // =========================
    const sqlValues = values.map((v) => [
      v.id,
      v.batch_id,
      v.element_type_id,
      v.x,
      v.y,
      v.width,
      v.height,
      v.rotation,
      v.asset_id,
      v.font_size,
      v.font_weight,
    ]);

    // =========================
    // 4. UPSERT
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
      [sqlValues]
    );

    // =========================
    // 5. DELETE MISSING
    // =========================
    const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));

    if (toDelete.length) {
      await conn.query(`DELETE FROM template_positions WHERE id IN (?)`, [
        toDelete,
      ]);
    }

    // =========================
    // 6. CACHE INVALIDATION
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
