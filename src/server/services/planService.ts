import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { IPlan, ICreatePlan, IUpdatePlan } from '@/types/plan';
import { randomUUID } from 'crypto';

const CACHE_ALL_PLANS = 'plans:all';

// GET
export const getAllPlans = async (): Promise<IPlan[]> => {
  const cached = await redis.get<IPlan[]>(CACHE_ALL_PLANS);
  if (cached) return cached;
  const [rows] = await pool.query('SELECT * FROM plans');
  const plans = rows as IPlan[];
  await redis.set(CACHE_ALL_PLANS, plans, { ex: 60 });
  return plans;
};

// GET BY ID
export const getPlanById = async (id: string): Promise<IPlan | null> => {
  const [rows] = await pool.query('SELECT * FROM plans WHERE id = ?', [id]);
  return (rows as IPlan[])[0] || null;
};

// POST
export const createPlan = async (plan: ICreatePlan): Promise<ICreatePlan> => {
  const planId = randomUUID();
  await pool.query(
    `INSERT INTO plans
        (id, name, price)
        VALUES (?, ?, ?)`,
    [planId, plan.name, plan.price]
  );
  await redis.del(CACHE_ALL_PLANS);
  return {
    id: planId,
    name: plan.name,
    price: plan.price,
  };
};

// ===============================
// (PATCH)
// ===============================
export const updatePlan = async (
  id: string,
  data: Partial<IUpdatePlan>
): Promise<IPlan | null> => {
  if (!id) {
    throw new Error('Plan ID is required');
  }

  const allowedFields: (keyof IUpdatePlan)[] = ['name', 'price'];

  const fields = Object.keys(data).filter((key) =>
    allowedFields.includes(key as keyof IUpdatePlan)
  );

  // kalau ga ada yang diupdate → return existing
  if (!fields.length) {
    return getPlanById(id);
  }

  const values = fields.map((field) => data[field as keyof IUpdatePlan]);

  const setClause = fields.map((field) => `${field} = ?`).join(', ');

  await pool.query(
    `UPDATE plans 
         SET ${setClause}, updated_at = NOW() 
         WHERE id = ?`,
    [...values, id]
  );

  // 🔥 cache invalidation
  await redis.del(CACHE_ALL_PLANS);
  await redis.del(`${CACHE_ALL_PLANS}:${id}`);

  return getPlanById(id);
};

// ===============================
// DELETE
// ===============================
export const deletePlan = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM plans WHERE id = ?', [id]);
  await redis.del(CACHE_ALL_PLANS);
};
