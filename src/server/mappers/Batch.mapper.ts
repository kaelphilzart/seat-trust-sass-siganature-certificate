import { BatchRow } from '../interfaces/Batch.interface';

export const mapBatch = (row: BatchRow) => {
  return {
    id: row.id,
    name: row.name,
    organization_id: row.organization_id,
    template_id: row.template_id,
    start_date: row.start_date,
    end_date: row.end_date,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,

    participants_count: Number(row.participants_count) || 0,

    template: row.template_id
      ? {
          id: row.template_id,
          name: row.template_name,
          file_path: row.template_file_path,
        }
      : null,

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
