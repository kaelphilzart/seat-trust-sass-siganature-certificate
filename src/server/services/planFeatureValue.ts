import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import {
  IPlanFeatureValue,
  ICreatePlanFeatureValue,
  IUpdatePlanFeatureValue,
} from '@/types/plan-feature-value';
import { randomUUID } from 'crypto';
import { PlanFeatureValueRow } from '../interfaces/PlanFeatureValue.interface';
import { mapPlanFeatureValue } from '../mappers/PlanFeatureValue.mapper';

const CACHE_ALL_PLAN_FEATURE_VALUES = 'plan_feature_values:all';

// GET
export const getAllPlanFeatureValues = async (
  planId?: string
): Promise<IPlanFeatureValue[]> => {
  const cacheKey = planId
    ? `${CACHE_ALL_PLAN_FEATURE_VALUES}:${planId}`
    : CACHE_ALL_PLAN_FEATURE_VALUES;

  const cached = await redis.get<IPlanFeatureValue[]>(cacheKey);
  if (cached) return cached;

  let query = `
        SELECT 
          pfv.id AS plan_feature_value_id,
          pfv.plan_id,
          pfv.value,
          pfv.created_at AS pfv_created_at,
          pfv.updated_at AS pfv_updated_at,

          f.id AS feature_id,
          f.feature_key,
          f.display_name,
          f.description,
          f.feature_type,
          f.category,
          f.created_at AS feature_created_at,
          f.updated_at AS feature_updated_at

        FROM plan_feature_values pfv
        JOIN features f ON pfv.feature_id = f.id
    `;

  const params: string[] = [];

  if (planId) {
    query += ' WHERE pfv.plan_id = ?';
    params.push(planId);
  }

  const [rows] = await pool.query<PlanFeatureValueRow[]>(query, params);
  const formatted = rows.map(mapPlanFeatureValue);
  await redis.set(cacheKey, formatted, { ex: 60 });
  return formatted;
};

// GET ONE BY ID
export const getPlanFeatureValueById = async (
  id: string
): Promise<IPlanFeatureValue | null> => {
  if (!id) {
    throw new Error('Plan Feature Value ID is required');
  }

  const cacheKey = `${CACHE_ALL_PLAN_FEATURE_VALUES}:${id}`;

  const cached = await redis.get<IPlanFeatureValue>(cacheKey);
  if (cached) return cached;

  const [rows] = await pool.query<PlanFeatureValueRow[]>(
    `
        SELECT 
          pfv.id AS plan_feature_value_id,
          pfv.plan_id,
          pfv.value,
          pfv.created_at AS pfv_created_at,
          pfv.updated_at AS pfv_updated_at,

          f.id AS feature_id,
          f.feature_key,
          f.display_name,
          f.description,
          f.feature_type,
          f.category,
          f.created_at AS feature_created_at,
          f.updated_at AS feature_updated_at

        FROM plan_feature_values pfv
        JOIN features f ON pfv.feature_id = f.id
        WHERE pfv.id = ?
        LIMIT 1
        `,
    [id]
  );

  const row = rows[0];
  if (!row) return null;

  const result = mapPlanFeatureValue(row);

  await redis.set(cacheKey, result, { ex: 60 });

  return result;
};

// POST
export const createPlanFeatureValues = async (
  planFeatureValues: ICreatePlanFeatureValue[]
): Promise<ICreatePlanFeatureValue[]> => {
  const inserted: ICreatePlanFeatureValue[] = [];

  for (const pfv of planFeatureValues) {
    const planFeatureValueId = randomUUID();

    await pool.query(
      `INSERT INTO plan_feature_values
       (id, plan_id, feature_id, value)
       VALUES (?, ?, ?, ?)`,
      [planFeatureValueId, pfv.plan_id, pfv.feature_id, pfv.value]
    );

    inserted.push({
      id: planFeatureValueId,
      plan_id: pfv.plan_id,
      feature_id: pfv.feature_id,
      value: pfv.value,
    });
  }

  return inserted;
};

export const createPlanFeatureValueByParam = async (
  planId: string,
  data: ICreatePlanFeatureValue
): Promise<ICreatePlanFeatureValue> => {
  const id = randomUUID();

  await pool.query(
    `INSERT INTO plan_feature_values (id, plan_id, feature_id, value)
     VALUES (?, ?, ?, ?)`,
    [id, planId, data.feature_id, data.value]
  );

  await redis.del(CACHE_ALL_PLAN_FEATURE_VALUES);
  return {
    id,
    plan_id: planId,
    feature_id: data.feature_id,
    value: data.value,
  };
};

// ===============================
// (PATCH)
// ===============================
export const updatePlanFeatureValue = async (
  id: string,
  data: Partial<IUpdatePlanFeatureValue>
): Promise<IPlanFeatureValue | null> => {
  if (!id) {
    throw new Error('Plan Feature Value ID is required');
  }

  const allowedFields: (keyof IUpdatePlanFeatureValue)[] = [
    'plan_id',
    'feature_id',
    'value',
  ];

  const fields = Object.keys(data).filter((key) =>
    allowedFields.includes(key as keyof IUpdatePlanFeatureValue)
  );

  // kalau ga ada perubahan → return existing
  if (!fields.length) {
    return getPlanFeatureValueById(id);
  }

  const values = fields.map(
    (field) => data[field as keyof IUpdatePlanFeatureValue]
  );

  const setClause = fields.map((field) => `${field} = ?`).join(', ');

  await pool.query(
    `
    UPDATE plan_feature_values 
    SET ${setClause}, updated_at = NOW() 
    WHERE id = ?
    `,
    [...values, id]
  );

  // 🔥 cache invalidation (global + byId)
  await redis.del(CACHE_ALL_PLAN_FEATURE_VALUES);
  await redis.del(`${CACHE_ALL_PLAN_FEATURE_VALUES}:${id}`);

  return getPlanFeatureValueById(id);
};

// ===============================
// DELETE
// ===============================
export const deletePlanFeatureValue = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM plan_feature_values WHERE id = ?', [id]);
  await redis.del(CACHE_ALL_PLAN_FEATURE_VALUES);
};
