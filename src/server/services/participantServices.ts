import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import {
  IParticipant,
  ICreateParticipant,
  IUpdateParticipant,
} from '@/types/participant';
import { randomUUID } from 'crypto';
import {
  ParticipantRow,
  ParticipantBatchRow,
} from '../interfaces/Participant.interface';
import { mapParticipant } from '../mappers/Participant.mapper';

const CACHE_ALL_PARTICIPANTS = 'participants:all';

export const getAllParticipants = async (
  batch_id?: string
): Promise<IParticipant[]> => {
  const cacheKey = batch_id
    ? `${CACHE_ALL_PARTICIPANTS}:${batch_id}`
    : CACHE_ALL_PARTICIPANTS;

  const cached = await redis.get<IParticipant[]>(cacheKey);
  if (cached) return cached;

  const conditions: string[] = [];
  const values: string[] = [];

  if (batch_id) {
    conditions.push('p.batch_id = ?');
    values.push(batch_id);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const [rows] = await pool.query<ParticipantRow[]>(
    `
        SELECT 
          p.id,
          p.name,
          p.email,

          b.id AS batch_id,
          b.name AS batch_name,
          b.status,
          b.start_date,
          b.end_date,

          p.created_at,
          p.updated_at

        FROM participants p
        LEFT JOIN batches b ON b.id = p.batch_id

        ${whereClause}
        ORDER BY p.created_at DESC
        `,
    values
  );

  const participants = rows.map(mapParticipant);

  await redis.set(cacheKey, participants, { ex: 60 });

  return participants;
};

// GET BY ID
export const getParticipantById = async (
  id: string
): Promise<IParticipant | null> => {
  if (!id) {
    throw new Error('Participant ID is required');
  }

  const cacheKey = `${CACHE_ALL_PARTICIPANTS}:${id}`;

  const cached = await redis.get<IParticipant>(cacheKey);
  if (cached) return cached;

  const [rows] = await pool.query<ParticipantRow[]>(
    `
        SELECT 
          p.id,
          p.name,
          p.email,

          b.id AS batch_id,
          b.name AS batch_name,
          b.status,
          b.start_date,
          b.end_date,

          p.created_at,
          p.updated_at

        FROM participants p
        LEFT JOIN batches b ON b.id = p.batch_id

        WHERE p.id = ?
        LIMIT 1
        `,
    [id]
  );

  const row = rows[0];
  if (!row) return null;

  const participant = mapParticipant(row);

  await redis.set(cacheKey, participant, { ex: 60 });

  return participant;
};

// CREATE
export const createParticipantsBulk = async (
  data: ICreateParticipant[]
): Promise<boolean> => {
  if (!data.length) return false;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const values = data.map((item) => [
      randomUUID(),
      item.batch_id,
      item.name,
      item.email,
    ]);

    await conn.query(
      `
            INSERT INTO participants
            (id, batch_id, name, email)
            VALUES ?
            `,
      [values]
    );

    // cache invalidation
    const batchId = data[0].batch_id;

    await redis.del(CACHE_ALL_PARTICIPANTS);
    if (batchId) {
      await redis.del(`${CACHE_ALL_PARTICIPANTS}:${batchId}`);
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

//patch
export const updateParticipant = async (
  id: string,
  data: Partial<IUpdateParticipant>
): Promise<IParticipant | null> => {
  if (!id) {
    throw new Error('Participant ID is required');
  }

  const allowedFields: (keyof IUpdateParticipant)[] = [
    'name',
    'email',
    'batch_id',
  ];

  const fields = Object.keys(data).filter((key) =>
    allowedFields.includes(key as keyof IUpdateParticipant)
  );

  // kalau ga ada update → return existing
  if (!fields.length) {
    return getParticipantById(id);
  }

  const values = fields.map((field) => data[field as keyof IUpdateParticipant]);

  const setClause = fields.map((field) => `${field} = ?`).join(', ');

  await pool.query(
    `
        UPDATE participants 
        SET ${setClause}, updated_at = NOW() 
        WHERE id = ?
        `,
    [...values, id]
  );

  // =========================
  // get batch_id for cache invalidation (typed)
  // =========================
  const [rows] = await pool.query<ParticipantBatchRow[]>(
    `SELECT batch_id FROM participants WHERE id = ?`,
    [id]
  );

  const batchId = rows[0]?.batch_id;

  // =========================
  // cache invalidation
  // =========================
  await redis.del(CACHE_ALL_PARTICIPANTS);
  await redis.del(`${CACHE_ALL_PARTICIPANTS}:${id}`);

  if (batchId) {
    await redis.del(`${CACHE_ALL_PARTICIPANTS}:${batchId}`);
  }

  return getParticipantById(id);
};

// delete
export const deleteParticipantsBulk = async (
  ids: string[]
): Promise<boolean> => {
  if (!ids.length) return false;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // =========================
    // 1. GET batch_ids (for cache invalidation)
    // =========================
    const [rows] = await conn.query<ParticipantBatchRow[]>(
      `
            SELECT DISTINCT batch_id 
            FROM participants
            WHERE id IN (?)
            `,
      [ids]
    );

    const batchIds = rows.map((r) => r.batch_id).filter(Boolean) as string[];

    // =========================
    // 2. DELETE BULK PARTICIPANTS
    // =========================
    await conn.query(`DELETE FROM participants WHERE id IN (?)`, [ids]);

    // =========================
    // 3. CACHE INVALIDATION
    // =========================
    const cacheTasks = [
      redis.del(CACHE_ALL_PARTICIPANTS),
      ...batchIds.map((batchId) =>
        redis.del(`${CACHE_ALL_PARTICIPANTS}:${batchId}`)
      ),
    ];

    await Promise.all(cacheTasks);

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
