import { TemplateRow } from '../interfaces/Template.interface';

export const mapTemplate = (row: TemplateRow) => {
  return {
    id: row.id,
    name: row.name ?? undefined,
    file_path: row.file_path ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,

    organization: row.org_id
      ? {
          id: row.org_id,
          name: row.org_name,
          slug: row.org_slug ?? null,
          logo: row.org_logo ?? null,
        }
      : undefined,
  };
};
