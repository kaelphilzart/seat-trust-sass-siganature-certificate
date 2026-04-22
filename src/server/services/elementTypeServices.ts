import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import {
  ICreateElementType,
  IUpdateElementType,
  IElementType,
} from '@/types/element-type';
import { randomUUID } from 'crypto';

const CACHE_ALL_ELEMENT_TYPE = 'element_types:all';

// GET
export const getAllElementTypes = async (): Promise<IElementType[]> => {
  // cek cache dulu
  const cached = await redis.get<IElementType[]>(CACHE_ALL_ELEMENT_TYPE);
  if (cached) return cached;
  const [rows] = await pool.query('SELECT * FROM element_types');
  const elements = rows as IElementType[];
  await redis.set(CACHE_ALL_ELEMENT_TYPE, elements, { ex: 60 });

  return elements;
};

// GET BY ID
export const getElementTypeById = async (
  id: string
): Promise<IElementType | null> => {
  const [rows] = await pool.query('SELECT * FROM element_types WHERE id = ?', [
    id,
  ]);
  return (rows as IElementType[])[0] || null;
};

// POST
export const createElementType = async (
  element: ICreateElementType
): Promise<ICreateElementType> => {
  const elementId = randomUUID();

  await pool.query(
    `INSERT INTO element_types
     (id, code, name, default_width, default_height, default_rotation, icon_path, feature_key, ui_type, element_kind, asset_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      elementId,
      element.code,
      element.name,
      element.default_width,
      element.default_height,
      element.default_rotation,
      element.icon_path,

      // ✅ NEW
      element.feature_key,
      element.ui_type,
      element.element_kind,
      element.asset_type,
    ]
  );

  await redis.del(CACHE_ALL_ELEMENT_TYPE);

  return {
    id: elementId,
    ...element,
  };
};

// ===============================
// (PATCH)
// ===============================
export const updateElementType = async (
  id: string,
  data: Partial<IUpdateElementType>
) => {
  const allowedFields = [
    'name',
    'code',
    'default_width',
    'default_height',
    'default_rotation',
    'icon_path',
    'ui_type',
    'element_kind',
    'asset_type',
    'feature_key',
  ];

  const fields = Object.keys(data).filter((key) => allowedFields.includes(key));

  if (!fields.length) {
    return getElementTypeById(id);
  }

  const values = fields.map((field) => {
    const key = field as keyof IUpdateElementType;
    const val = data[key];

    // number fields
    if (
      key === 'default_width' ||
      key === 'default_height' ||
      key === 'default_rotation'
    ) {
      return typeof val === 'number' ? val : null;
    }

    // nullable string fields
    if (
      key === 'ui_type' ||
      key === 'element_kind' ||
      key === 'asset_type' ||
      key === 'feature_key'
    ) {
      return val ?? null;
    }

    return val ?? null;
  });

  const setClause = fields.map((field) => `${field} = ?`).join(', ');

  await pool.query(
    `
        UPDATE element_types 
        SET ${setClause}, updated_at = NOW() 
        WHERE id = ?
        `,
    [...values, id]
  );

  await redis.del(CACHE_ALL_ELEMENT_TYPE);

  return getElementTypeById(id);
};

// ===============================
// DELETE
// ===============================
export const deleteElementType = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM element_types WHERE id = ?', [id]);
  await redis.del(CACHE_ALL_ELEMENT_TYPE);
};
