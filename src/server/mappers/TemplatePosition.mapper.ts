import { TemplatePositionRow } from '../interfaces/TemplatePosition.interface';

export const mapTemplatePosition = (row: TemplatePositionRow) => {
  return {
    id: row.id,
    batch_id: row.batch_id,

    element_type_id: row.element_type_id ?? undefined,

    x: row.x ?? undefined,
    y: row.y ?? undefined,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    rotation: row.rotation ?? undefined,

    font_size: row.font_size,
    font_weight: row.font_weight,

    created_at: row.created_at,
    updated_at: row.updated_at,

    // 🔥 element_type (from join)
    element_type: row.et_id
      ? {
          id: row.et_id,
          code: row.et_code,
          name: row.et_name,
          ui_type: row.et_ui_type,
          icon_path: row.et_icon_path,
          default_width: row.et_default_width ?? undefined,
          default_height: row.et_default_height ?? undefined,
        }
      : null,

    // 🔥 asset
    asset: row.asset_id
      ? {
          id: row.asset_id,
          name: row.asset_name,
          type: row.asset_type,
          file_path: row.asset_file_path,
          organization: row.org_id
            ? {
                id: row.org_id,
                name: row.org_name,
                slug: row.org_slug,
                logo: row.org_logo,
              }
            : null,
        }
      : null,
  };
};
