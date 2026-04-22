import { RowDataPacket } from 'mysql2';

export interface BatchRow extends RowDataPacket {
  id: string;
  name: string;
  organization_id: string;
  template_id: string;
  start_date: Date;
  end_date: Date;
  status: number;
  created_at: Date;
  updated_at: Date;

  template_id_join: string;
  template_name: string;
  template_file_path: string;

  org_id: string;
  org_name: string;
  org_slug: string;
  org_logo: string;

  participants_count: number;
}

export interface BatchOrgRow extends RowDataPacket {
  organization_id: string;
}
