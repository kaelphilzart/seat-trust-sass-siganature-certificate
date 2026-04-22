import { pool } from '@/lib/db';
import { redis } from '@/lib/redis';
import { ICreateTemplate } from '@/types/template';
import { randomUUID } from 'crypto';
import { TemplateRow, TemplateOrgRow } from '../interfaces/Template.interface';
import { mapTemplate } from '../mappers/Template.mapper';

const CACHE_ALL_TEMPLATES = 'template:all';

// GET
export const getAllTemplates = async (organization_id?: string) => {
  const cacheKey = organization_id
    ? `${CACHE_ALL_TEMPLATES}:${organization_id}`
    : CACHE_ALL_TEMPLATES;

  const cached = await redis.get(cacheKey);
  if (cached) return cached;

  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (organization_id) {
    conditions.push('t.organization_id = ?');
    values.push(organization_id);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const [rows] = await pool.query<TemplateRow[]>(
    `
    SELECT 
      t.id,
      t.name,
      t.file_path,
      t.organization_id,
      t.created_at,
      t.updated_at,

      o.id as org_id,
      o.name as org_name,
      o.slug as org_slug,
      o.logo as org_logo

    FROM templates t
    LEFT JOIN organizations o
      ON o.id = t.organization_id
    ${whereClause}
    ORDER BY t.created_at DESC
    `,
    values
  );

  const templates = rows.map(mapTemplate);

  await redis.set(cacheKey, templates, { ex: 60 });

  return templates;
};

// GET BY ID
export const getTemplateById = async (id: string) => {
  if (!id) {
    throw new Error('Template ID is required');
  }

  const [rows] = await pool.query<TemplateRow[]>(
    `
    SELECT 
      t.id,
      t.name,
      t.file_path,
      t.organization_id,
      t.created_at,
      t.updated_at,

      o.id as org_id,
      o.name as org_name,
      o.slug as org_slug,
      o.logo as org_logo

    FROM templates t
    LEFT JOIN organizations o
      ON o.id = t.organization_id
    WHERE t.id = ?
    LIMIT 1
    `,
    [id]
  );

  const row = rows[0];
  if (!row) return null;

  return mapTemplate(row);
};

// ===============================
// (POST)
// ===============================
export const createTemplate = async (data: {
  name: string;
  file_path: string;
  organization_id: string;
}): Promise<ICreateTemplate> => {
  const id = randomUUID();

  await pool.query(
    `
    INSERT INTO templates
    (id, organization_id, name, file_path)
    VALUES (?, ?, ?, ?)
    `,
    [id, data.organization_id, data.name, data.file_path]
  );

  await redis.del(CACHE_ALL_TEMPLATES);
  await redis.del(`${CACHE_ALL_TEMPLATES}:${data.organization_id}`);

  return {
    id,
    ...data,
  };
};

// ===============================
// (PATCH)
// ===============================
// export const updateTemplate = async (
//     id: string,
//     data: IUpdateOrganizationUser
// ): Promise<IOrganizationUser | null> => {

//     /* ================= ambil user_id dulu ================= */

//     const [rows]: any = await pool.query(
//         `SELECT user_id, organization_id
//      FROM organization_users
//      WHERE id = ?`,
//         [id]
//     );

//     if (!rows.length) {
//         return null;
//     }

//     const userId = rows[0].user_id;
//     const organizationId = rows[0].organization_id;

//     /* ================= update role ================= */

//     if (data.role) {
//         await pool.query(
//             `UPDATE organization_users
//        SET role = ?, updated_at = NOW()
//        WHERE id = ?`,
//             [data.role, id]
//         );
//     }

//     /* ================= update user ================= */

//     const userFields: string[] = [];
//     const userValues: any[] = [];

//     if (data.email) {
//         userFields.push("email = ?");
//         userValues.push(data.email);
//     }

//     if (data.password) {
//         const hashedPassword = await bcrypt.hash(data.password, 10);

//         userFields.push("password = ?");
//         userValues.push(hashedPassword);
//     }

//     if (userFields.length) {
//         await pool.query(
//             `UPDATE users
//        SET ${userFields.join(", ")}, updated_at = NOW()
//        WHERE id = ?`,
//             [...userValues, userId]
//         );
//     }

//     /* ================= clear cache ================= */

//     await redis.del(`${CACHE_ALL_ORGANIZATIONS_USERS}:${organizationId}`);

//     /* ================= return updated data ================= */

//     return getOrganizationUserById({ id });
// };

// ===============================
// DELETE
// ===============================
export const deleteTemplate = async (id: string): Promise<void> => {
  const [rows] = await pool.query<TemplateOrgRow[]>(
    'SELECT organization_id FROM templates WHERE id = ?',
    [id]
  );

  const organizationId = rows?.[0]?.organization_id;
  await pool.query('DELETE FROM templates WHERE id = ?', [id]);
  await redis.del(CACHE_ALL_TEMPLATES);
  if (organizationId) {
    await redis.del(`${CACHE_ALL_TEMPLATES}:${organizationId}`);
  }
};
