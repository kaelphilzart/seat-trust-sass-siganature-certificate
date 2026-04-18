import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { IPlanFeatureValue, ICreatePlanFeatureValue, IUpdatePlanFeatureValue } from '@/types/plan-feature-value';
import { IFeature } from '@/types/feature';
import { randomUUID } from 'crypto';

const CACHE_ALL_PLAN_FEATURE_VALUES = 'plan_feature_values:all';

// GET
export const getAllPlanFeatureValues = async (planId?: string): Promise<IPlanFeatureValue[]> => {
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

  const params: any[] = [];
  if (planId) {
    query += ' WHERE pfv.plan_id = ?';
    params.push(planId);
  }

  const [rows] = await pool.query(query, params);

  // Map ke interface yang nested
  const formatted = (rows as any[]).map(r => ({
    id: r.plan_feature_value_id,
    plan_id: r.plan_id,
    value: r.value,
    created_at: r.pfv_created_at,
    updated_at: r.pfv_updated_at,
    feature: {
      id: r.feature_id,
      feature_key: r.feature_key,
      display_name: r.display_name,
      description: r.description,
      feature_type: r.feature_type,
      category: r.category,
    }
  }));

  await redis.set(CACHE_ALL_PLAN_FEATURE_VALUES, formatted, { ex: 60 });

  return formatted as IPlanFeatureValue[];
};

// GET ONE BY ID
export const getPlanFeatureValueById = async (id: string): Promise<IPlanFeatureValue | null> => {
  const [rows] = await pool.query('SELECT * FROM plan_feature_values WHERE id = ?', [id]);
  return (rows as IPlanFeatureValue[])[0] || null;
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
    value: data.value
  };
};

// ===============================
// (PATCH)
// ===============================
export const updatePlanFeatureValue = async (
  id: string,
  data: Partial<IUpdatePlanFeatureValue>
): Promise<IUpdatePlanFeatureValue | null> => {
  const allowedFields = ['plan_id', 'feature_id', 'value'];
  const fields = Object.keys(data).filter((key) => allowedFields.includes(key));
  if (!fields.length) return getPlanFeatureValueById(id);
  const values = fields.map((field) => (data as any)[field]);
  const setClause = fields.map((field) => `${field} = ?`).join(', ');

  await pool.query(
    `UPDATE plan_feature_values SET ${setClause}, updated_at = NOW() WHERE id = ?`,
    [...values, id]
  );
  await redis.del(CACHE_ALL_PLAN_FEATURE_VALUES);
  return getPlanFeatureValueById(id);
};

// ===============================
// DELETE
// ===============================
export const deletePlanFeatureValue = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM plan_feature_values WHERE id = ?', [id]);
  await redis.del(CACHE_ALL_PLAN_FEATURE_VALUES);
};