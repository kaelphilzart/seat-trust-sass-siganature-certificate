import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { ISubscription, ICreateSubscription, IUpdateSubscription } from '@/types/subscription';
import { randomUUID } from 'crypto';

const CACHE_ALL_SUBSCRIPTIONS = 'subscriptions:all';
const CACHE_ALL_ORGANIZATIONS = 'organizations:all';

// GET
export const getAllSubscriptions = async (
  organizationId?: string
): Promise<ISubscription[]> => {

  let query = `
    SELECT 
      s.id AS subscription_id,
      s.organization_id AS subscription_organization_id,
      s.plan_id AS subscription_plan_id,
      s.start_date,
      s.end_date,
      s.status,
      s.created_at AS subscription_created_at,
      s.updated_at AS subscription_updated_at,

      o.id AS org_id,
      o.name AS org_name,
      o.slug AS org_slug,
      o.logo AS org_logo,

      p.id AS plan_id,
      p.name AS plan_name,
      p.price AS plan_price

    FROM subscriptions s
    JOIN organizations o ON s.organization_id = o.id
    JOIN plans p ON s.plan_id = p.id
  `;

  const params: any[] = [];

  if (organizationId) {
    query += ` WHERE s.organization_id = ?`;
    params.push(organizationId);
  }

  const [rows] = await pool.query(query, params);

  const formatted: ISubscription[] = (rows as any[]).map((r) => ({
    id: r.subscription_id,
    plan_id: r.subscription_plan_id,
    organization_id: r.subscription_organization_id,

    start_date: new Date(r.start_date),
    end_date: new Date(r.end_date),

    status: Boolean(r.status),

    created_at: new Date(r.subscription_created_at),
    updated_at: new Date(r.subscription_updated_at),

    plan: {
      id: r.plan_id,
      name: r.plan_name,
      price: r.plan_price,
    },

    organization: {
      id: r.org_id,
      name: r.org_name,
      slug: r.org_slug,
      logo: r.org_logo,
    },
  }));

  await redis.set(
    CACHE_ALL_SUBSCRIPTIONS,
    JSON.stringify(formatted),
    { ex: 60 }
  );

  return formatted;
};



// GET ONE BY ID
export const getSubscriptionById = async (id: string): Promise<ISubscription | null> => {
  const [rows] = await pool.query('SELECT * FROM subscriptions WHERE id = ?', [id]);
  return (rows as ISubscription[])[0] || null;
};

// POST
export const createSubscription = async (
  subscription: ICreateSubscription[]
): Promise<ICreateSubscription[]> => {
  const inserted: ICreateSubscription[] = [];

  for (const s of subscription) {
    const subscriptionId = randomUUID();

    await pool.query(
      `INSERT INTO subscriptions
       (id, organization_id, plan_id, start_date, end_date)
       VALUES (?, ?, ?, ?, ?)`,
      [
        subscriptionId,
        s.organization_id,
        s.plan_id,
        s.start_date,
        s.end_date,
      ]
    );
    inserted.push({
      id: subscriptionId,
      organization_id: s.organization_id,
      plan_id: s.plan_id,
      start_date: s.start_date,
      end_date: s.end_date,
      status: s.status,
    });
  }

  return inserted;
}

export const createSubscriptionByParam = async (
  organizationId: string,
  data: ICreateSubscription
): Promise<ICreateSubscription> => {

  const subscriptionId = randomUUID();

  await pool.query(
    `INSERT INTO subscriptions
     (id, organization_id, plan_id, start_date, end_date, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      subscriptionId,
      organizationId,
      data.plan_id,
      data.start_date,
      data.end_date,
      data.status,
    ]
  );

  return {
    id: subscriptionId,
    organization_id: organizationId,
    plan_id: data.plan_id,
    start_date: data.start_date,
    end_date: data.end_date,
    status: data.status,
  };
};
    
// ===============================
// (PATCH)
// ===============================
export const updateSubscription = async (
  id: string,
  data: Partial<IUpdateSubscription>
): Promise<IUpdateSubscription | null> => {

  const allowedFields = [
    'plan_id',
    'start_date',
    'end_date',
    'status'
  ];

  const fields = Object.keys(data).filter((key) =>
    allowedFields.includes(key)
  );

  if (!fields.length) return getSubscriptionById(id);

  const values = fields.map((field) => (data as any)[field]);

  const setClause = fields
    .map((field) => `${field} = ?`)
    .join(', ');

  await pool.query(
    `UPDATE subscriptions SET ${setClause}, updated_at = NOW() WHERE id = ?`,
    [...values, id]
  );

  await redis.del(CACHE_ALL_ORGANIZATIONS);
  await redis.del(CACHE_ALL_SUBSCRIPTIONS);

  return getSubscriptionById(id);
};

// ===============================
// DELETE
// ===============================
export const deleteSubscription = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM subscriptions WHERE id = ?', [id]);
  await redis.del(CACHE_ALL_SUBSCRIPTIONS);
};