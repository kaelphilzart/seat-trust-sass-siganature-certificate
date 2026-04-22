import { RowDataPacket } from 'mysql2';

export interface TemplateRow extends RowDataPacket {
  id: string;
  name: string | null;
  file_path: string | null;
  organization_id: string | null;
  created_at: Date;
  updated_at: Date;

  // organization
  org_id: string;
  org_name: string;
  org_slug: string | null;
  org_logo: string | null;
}

export interface TemplateOrgRow extends RowDataPacket {
  organization_id: string;
}
