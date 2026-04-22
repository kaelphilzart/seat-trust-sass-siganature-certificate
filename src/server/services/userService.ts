import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { IUser, ICreateUser, IUpdateUser } from '@/types/user';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const CACHE_ALL_USERS = 'users:all';
const CACHE_ALL_ORGANIZATIONS_USERS = 'organization_users:all';

// GET ALL USERS WITH CACHE
export const getAllUsers = async (): Promise<IUser[]> => {
  const cacheKey = 'users:all';

  const cached = await redis.get<IUser[]>(cacheKey);
  if (cached) return cached;
  const [rows] = await pool.query('SELECT * FROM users');
  const users = rows as IUser[];
  await redis.set(cacheKey, users, { ex: 60 });
  return users;
};

// GET USER BY ID
export const getUserById = async (id: string): Promise<IUser | null> => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return (rows as IUser[])[0] || null;
};

// CREATE USER
export const createUser = async (user: ICreateUser): Promise<IUser> => {
  const { email, password } = user;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = randomUUID();

  await pool.query(
    `INSERT INTO users
      (id, email, password, is_active, created_at, updated_at)
     VALUES (?, ?, ?, true, NOW(), NOW())`,
    [userId, email, hashedPassword]
  );
  await redis.del('users:all');
  return {
    id: userId,
    email,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };
};

// ===============================
// UPDATE USER (PATCH)
// ===============================
type AllowedField = 'email' | 'is_active';

export const updateUser = async (
  id: string,
  data: Partial<IUpdateUser>
): Promise<IUser | null> => {
  const allowedFields: AllowedField[] = ['email', 'is_active'];

  const fields = allowedFields.filter((key) => key in data);

  if (!fields.length) return getUserById(id);

  const values = fields.map((field) => data[field as keyof IUpdateUser]);
  const setClause = fields.map((field) => `${field} = ?`).join(', ');

  await pool.query(
    `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = ?`,
    [...values, id]
  );

  await redis.del(CACHE_ALL_USERS);
  await redis.del(CACHE_ALL_ORGANIZATIONS_USERS);

  return getUserById(id);
};

// ===============================
// DELETE USER
// ===============================
export const deleteUser = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
  await redis.del(CACHE_ALL_USERS);
};
