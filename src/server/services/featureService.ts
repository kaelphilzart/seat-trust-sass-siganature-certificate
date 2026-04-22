import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { IFeature, ICreateFeature, IUpdateFeature } from '@/types/feature';
import { randomUUID } from 'crypto';

const CACHE_ALL_FEATURES = 'features:all';

// GET
export const getAllFeatures = async (): Promise<IFeature[]> => {
  const cached = await redis.get<IFeature[]>(CACHE_ALL_FEATURES);
  if (cached) return cached;
  const [rows] = await pool.query('SELECT * FROM features');
  const users = rows as IFeature[];
  await redis.set(CACHE_ALL_FEATURES, users, { ex: 60 });
  return users;
};

// GET BY ID
export const getFeatureById = async (id: string): Promise<IFeature | null> => {
  const [rows] = await pool.query('SELECT * FROM features WHERE id = ?', [id]);
  return (rows as IFeature[])[0] || null;
};

// POST
export const createFeature = async (
  feature: ICreateFeature
): Promise<ICreateFeature> => {
  const featureId = randomUUID();
  await pool.query(
    `INSERT INTO features
        (id, feature_key, display_name, description, feature_type, category)
        VALUES (?, ?, ?, ?, ?, ?)`,
    [
      featureId,
      feature.feature_key,
      feature.display_name,
      feature.description,
      feature.feature_type,
      feature.category,
    ]
  );
  await redis.del(CACHE_ALL_FEATURES);
  return {
    id: featureId,
    feature_key: feature.feature_key,
    display_name: feature.display_name,
    description: feature.description,
    feature_type: feature.feature_type,
    category: feature.category,
  };
};

// ===============================
// (PATCH)
// ===============================
export const updateFeature = async (
  id: string,
  data: Partial<IUpdateFeature>
) => {
  const allowedFields = ['email', 'is_active'];

  const fields = Object.keys(data).filter((key) => allowedFields.includes(key));

  if (!fields.length) {
    return getFeatureById(id);
  }

  const values = fields.map((field) => data[field as keyof IUpdateFeature]);

  const setClause = fields.map((field) => `${field} = ?`).join(', ');

  await pool.query(
    `
        UPDATE features 
        SET ${setClause}, updated_at = NOW() 
        WHERE id = ?
        `,
    [...values, id]
  );

  await redis.del(CACHE_ALL_FEATURES);

  return getFeatureById(id);
};
// ===============================
// DELETE
// ===============================
export const deleteFeature = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM features WHERE id = ?', [id]);
  await redis.del(CACHE_ALL_FEATURES);
};
