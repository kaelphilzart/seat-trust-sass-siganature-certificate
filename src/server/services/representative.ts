import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { IRepresentative, ICreateRepresentative, IUpdateRepresentative } from '@/types/representative';
import { randomUUID } from 'crypto';

const CACHE_ALL_REPRESENTATIVES = 'representative:all';

// GET
export const getAllRepresentatives = async (
    organization_id?: string
): Promise<IRepresentative[]> => {
    const cacheKey = organization_id
        ? `${CACHE_ALL_REPRESENTATIVES}:${organization_id}`
        : CACHE_ALL_REPRESENTATIVES;

    const cached = await redis.get<IRepresentative[]>(cacheKey);
    if (cached) return cached;

    const conditions: string[] = [];
    const values: any[] = [];

    if (organization_id) {
        conditions.push("r.organization_id = ?");
        values.push(organization_id);
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const [rows] = await pool.query(
        `
    SELECT 
      r.id,
      r.name,
      r.title,
      r.organization_id,
      r.created_at,
      r.updated_at,

      o.id as org_id,
      o.name as org_name,
      o.slug as org_slug,
      o.logo as org_logo

    FROM representatives r
    LEFT JOIN organizations o
      ON o.id = r.organization_id
    ${whereClause}
    ORDER BY r.created_at DESC
    `,
        values
    );

    const representatives = (rows as any[]).map((row) => ({
        id: row.id,
        name: row.name,
        title: row.title,
        organization_id: row.organization_id,
        created_at: row.created_at,
        updated_at: row.updated_at,

        organization: row.org_id
            ? {
                id: row.org_id,
                name: row.org_name,
                slug: row.org_slug,
                logo: row.org_logo,
            }
            : null,
    }));

    await redis.set(cacheKey, representatives, { ex: 60 });

    return representatives;
};

// GET BY ID
export const getRepresentativeById = async (
    id: string
): Promise<IRepresentative | null> => {
    if (!id) {
        throw new Error("Representative ID is required");
    }

    const [rows] = await pool.query(
        `
    SELECT 
      r.id,
      r.name,
      r.title,
      r.organization_id,
      r.created_at,
      r.updated_at,

      o.id as org_id,
      o.name as org_name,
      o.slug as org_slug,
      o.logo as org_logo

    FROM representatives r
    LEFT JOIN organizations o
      ON o.id = r.organization_id
    WHERE r.id = ?
    LIMIT 1
    `,
        [id]
    );

    const row = (rows as any[])[0];
    if (!row) return null;

    return {
        id: row.id,
        name: row.name,
        title: row.title,
        created_at: row.created_at,
        updated_at: row.updated_at,

        organization: row.org_id
            ? {
                id: row.org_id,
                name: row.org_name,
                slug: row.org_slug,
                logo: row.org_logo,
            }
            : null,
    };
};

// ===============================
// (POST)
// ===============================
export const createRepresentative = async (data: ICreateRepresentative): Promise<IRepresentative> => {
    const id = randomUUID();

    await pool.query(
        `
    INSERT INTO representatives
    (id, organization_id, name, title)
    VALUES (?, ?, ?, ?)
    `,
        [id, data.organization_id, data.name, data.title]
    );

    await redis.del(CACHE_ALL_REPRESENTATIVES);
    await redis.del(`${CACHE_ALL_REPRESENTATIVES}:${data.organization_id}`);

    return {
        id,
        ...data,
    };
};

// ===============================
// (PATCH)
// ===============================
export const updateRepresentative = async (
    id: string,
    data: Partial<IUpdateRepresentative>
): Promise<IUpdateRepresentative | null> => {
    const allowedFields = ['name', 'title'];
    const fields = Object.keys(data).filter((key) => allowedFields.includes(key));
    if (!fields.length) return getRepresentativeById(id);
    const values = fields.map((field) => (data as any)[field]);
    const setClause = fields.map((field) => `${field} = ?`).join(', ');

    await pool.query(
        `UPDATE representatives SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        [...values, id]
    );
    const [rows]: any = await pool.query(
        `SELECT organization_id FROM representatives WHERE id = ?`,
        [id]
    );

    const organizationId = rows?.[0]?.organization_id;
    if (organizationId) {
        await redis.del(`${CACHE_ALL_REPRESENTATIVES}:${organizationId}`);
    }
    await redis.del(CACHE_ALL_REPRESENTATIVES);

    return getRepresentativeById(id);
};

// ===============================
// DELETE
// ===============================
export const deleteRepresentative = async (id: string): Promise<void> => {
  // ambil organization_id dulu SEBELUM delete
  const [rows]: any = await pool.query(
    'SELECT organization_id FROM representatives WHERE id = ?',
    [id]
  );

  const organizationId = rows?.[0]?.organization_id;

  // delete data
  await pool.query('DELETE FROM representatives WHERE id = ?', [id]);

  // 🔥 clear cache global
  await redis.del(CACHE_ALL_REPRESENTATIVES);

  // 🔥 clear cache per organization (INI YANG KURANG)
  if (organizationId) {
    await redis.del(`${CACHE_ALL_REPRESENTATIVES}:${organizationId}`);
  }
};