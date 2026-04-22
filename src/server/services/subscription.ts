import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import {
  ISubscription,
  ICreateSubscription,
  IUpdateSubscription,
} from '@/types/subscription';
import { randomUUID } from 'crypto';
import { SubscriptionRow } from '../interfaces/Subscription.interface';
import { mapSubscription } from '../mappers/Subscription.mapper';
import { getAuthUser } from '../helpers/auth';

const CACHE_ALL_SUBSCRIPTIONS = 'subscriptions:all';

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

  const params: (string | number)[] = [];

  if (organizationId) {
    query += ` WHERE s.organization_id = ?`;
    params.push(organizationId);
  }

  const [rows] = await pool.query<SubscriptionRow[]>(query, params);

  const formatted: ISubscription[] = rows.map(mapSubscription);

  await redis.set(CACHE_ALL_SUBSCRIPTIONS, formatted, { ex: 60 });

  return formatted;
};

// GET ONE BY ID
export const getSubscriptionById = async (
  id: string
): Promise<ISubscription | null> => {
  if (!id) {
    throw new Error('Subscription ID is required');
  }

  const [rows] = await pool.query<SubscriptionRow[]>(
    `
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

    WHERE s.id = ?
    LIMIT 1
    `,
    [id]
  );

  if (!rows.length) return null;

  return mapSubscription(rows[0]);
};

// POST
export const createSubscription = async (
  data: ICreateSubscription[],
  organizationIdParam?: string
): Promise<boolean> => {
  if (!data.length) return false;

  const user = await getAuthUser();

  const organizationId = organizationIdParam ?? user.organization_id;

  if (!organizationId) {
    throw new Error('Organization ID is required');
  }

  const values = data.map((item) => [
    randomUUID(),
    organizationId,
    item.plan_id,
    item.start_date,
    item.end_date,
    item.status ?? true,
  ]);

  await pool.query(
    `
    INSERT INTO subscriptions
    (id, organization_id, plan_id, start_date, end_date, status)
    VALUES ?
    `,
    [values]
  );

  return true;
};

// export const createSubscriptionByParam = async (
//   organizationId: string,
//   data: ICreateSubscription
// ): Promise<ICreateSubscription> => {

//   const subscriptionId = randomUUID();

//   await pool.query(
//     `INSERT INTO subscriptions
//      (id, organization_id, plan_id, start_date, end_date, status)
//      VALUES (?, ?, ?, ?, ?, ?)`,
//     [
//       subscriptionId,
//       organizationId,
//       data.plan_id,
//       data.start_date,
//       data.end_date,
//       data.status,
//     ]
//   );

//   return {
//     id: subscriptionId,
//     organization_id: organizationId,
//     plan_id: data.plan_id,
//     start_date: data.start_date,
//     end_date: data.end_date,
//     status: data.status,
//   };
// };

// ===============================
// (PATCH)
// ===============================
export const updateSubscription = async (
  id: string,
  data: Partial<IUpdateSubscription>
): Promise<boolean> => {
  if (!id) {
    throw new Error('Subscription ID is required');
  }

  const allowedFields: (keyof IUpdateSubscription)[] = [
    'plan_id',
    'start_date',
    'end_date',
    'status',
  ];

  const fields = Object.keys(data).filter((key) =>
    allowedFields.includes(key as keyof IUpdateSubscription)
  );

  if (!fields.length) return false;

  const values = fields.map(
    (field) => data[field as keyof IUpdateSubscription]
  );

  const setClause = fields.map((field) => `${field} = ?`).join(', ');

  const user = await getAuthUser();

  // 🔥 optional scope protection
  const query = user.organization_id
    ? `UPDATE subscriptions 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = ? AND organization_id = ?`
    : `UPDATE subscriptions 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = ?`;

  const params = user.organization_id
    ? [...values, id, user.organization_id]
    : [...values, id];

  await pool.query(query, params);

  // 🔥 cache invalidation yang bener
  await redis.del(CACHE_ALL_SUBSCRIPTIONS);
  if (user.organization_id) {
    await redis.del(`${CACHE_ALL_SUBSCRIPTIONS}:${user.organization_id}`);
  }

  return true;
};

// ===============================
// DELETE
// ===============================
export const deleteSubscription = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM subscriptions WHERE id = ?', [id]);
  await redis.del(CACHE_ALL_SUBSCRIPTIONS);
};
