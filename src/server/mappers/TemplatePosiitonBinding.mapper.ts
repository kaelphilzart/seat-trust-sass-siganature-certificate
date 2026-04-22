import { ITemplatePositionBinding } from '@/types/template-position-binding';
import { TemplatePositionBindingRow } from '../interfaces/TemplatePostionBinding.interface';

export const mapTemplatePositionBinding = (
  row: TemplatePositionBindingRow
): ITemplatePositionBinding => {
  return {
    id: row.id,
    batch_id: row.batch_id,

    templatePosition: row.template_position_id
      ? {
          id: row.template_position_id,
          batch_id: row.template_batch_id ?? '',
        }
      : null,

    batchRepresentative: row.batch_representative_id
      ? {
          id: row.batch_representative_id,
          batch: row.batch_id
            ? {
                id: row.batch_id,
                name: row.batch_name ?? '',
              }
            : null,

          representative: row.representative_id
            ? {
                id: row.representative_id,
                name: row.representative_name ?? '',
                title: row.representative_title ?? '',
              }
            : null,

          created_at: row.created_at,
          updated_at: row.updated_at,
        }
      : null,

    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};
