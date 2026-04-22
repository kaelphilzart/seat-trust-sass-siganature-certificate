import { RowDataPacket } from 'mysql2';

export interface OrganizationAssetRow extends RowDataPacket {
  id: string;
  name: string;
  type: string;
  file_path: string;
  created_at: Date;
  updated_at: Date;

  org_id: string | null;
  org_name: string | null;
}

export interface OrganizationAssetOrgRow extends RowDataPacket {
  organization_id: string | null;
}
