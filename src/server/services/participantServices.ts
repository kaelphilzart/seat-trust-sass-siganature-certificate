import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { IParticipant, ICreateParticipant, IUpdateParticipant } from '@/types/participant';
import { randomUUID } from 'crypto';
import { RowDataPacket } from "mysql2";

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
    const values: any[] = [];

    if (batch_id) {
        conditions.push('p.batch_id = ?');
        values.push(batch_id);
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    const [rows] = await pool.query<RowDataPacket[]>(
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

    const participants: IParticipant[] = rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        batch: {
            id: row.batch_id,
            name: row.batch_name,
            start_date: row.start_date,
            end_date: row.end_date,
            status: row.status,
        },
        created_at: row.created_at,
        updated_at: row.updated_at,
    }));

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

    const [rows] = await pool.query<RowDataPacket[]>(
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

    return {
        id: row.id,
        name: row.name,
        email: row.email,
        batch: {
            id: row.batch_id,
            name: row.batch_name,
            start_date: row.start_date,
            end_date: row.end_date,
            status: row.status,
        },

        created_at: row.created_at,
        updated_at: row.updated_at,
    };
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
): Promise<IUpdateParticipant | null> => {
    const allowedFields = ['name', 'email', 'batch_id'];
    const fields = Object.keys(data).filter((key) => allowedFields.includes(key));
    if (!fields.length) return getParticipantById(id);
    const values = fields.map((field) => (data as any)[field]);
    const setClause = fields.map((field) => `${field} = ?`).join(', ');

    await pool.query(
        `UPDATE participants SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        [...values, id]
    );
    const [rows]: any = await pool.query(
        `SELECT batch_id FROM participants WHERE id = ?`,
        [id]
    );

    const batchId = rows?.[0]?.batch_id;
    if (batchId) {
        await redis.del(`${CACHE_ALL_PARTICIPANTS}:${batchId}`);
    }
    await redis.del(CACHE_ALL_PARTICIPANTS);

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
        const [rows] = await conn.query<RowDataPacket[]>(
            `
            SELECT DISTINCT batch_id 
            FROM participants
            WHERE id IN (?)
            `,
            [ids]
        );

        const batchIds = rows.map((r: any) => r.batch_id);

        // =========================
        // 2. DELETE BULK PARTICIPANTS
        // =========================
        await conn.query(
            `DELETE FROM participants WHERE id IN (?)`,
            [ids]
        );

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




