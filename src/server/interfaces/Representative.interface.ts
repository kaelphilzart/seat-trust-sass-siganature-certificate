import { RowDataPacket } from 'mysql2';

export interface RepresentativeRow extends RowDataPacket {
  id: string;
  name: string;
  title: string;
  organization_id: string;

  created_at: string;
  updated_at: string;

  // organization
  org_id: string;
  org_name: string;
  org_slug: string | null;
  org_logo: string | null;
}

export interface RepresentativeOrgRow extends RowDataPacket {
  organization_id: string;
}
