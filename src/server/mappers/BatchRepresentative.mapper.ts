import { BatchRepresentativeRow } from '../interfaces/BatchRepresentative.interface';
export const mapBatchRepresentative = (row: BatchRepresentativeRow) => {
  return {
    id: row.id,

    batch: {
      id: row.batch_id,
      name: row.batch_name,
      start_date: row.start_date,
      end_date: row.end_date,
    },

    representative: row.representative_id
      ? {
          id: row.representative_id,
          name: row.representative_name,
          title: row.representative_title,
        }
      : null,

    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};
