import { RowDataPacket } from 'mysql2';

export interface TemplatePositionRow extends RowDataPacket {
  id: string;
  batch_id: string;
  element_type_id: string | null;
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
  rotation: number | null;
  font_size: number | null;
  font_weight: string | null;
  created_at: string;
  updated_at: string;

  // element type
  et_id: string | null;
  et_code: string | null;
  et_name: string | null;
  et_ui_type: string | null;
  et_icon_path: string | null;
  et_default_width: number | null;
  et_default_height: number | null;

  // asset
  asset_id: string | null;
  asset_name: string | null;
  asset_type: string | null;
  asset_file_path: string | null;

  // organization
  org_id: string | null;
  org_name: string | null;
  org_slug: string | null;
  org_logo: string | null;
}

export interface ExistingTemplatePositionRow extends RowDataPacket {
  id: string;
}
