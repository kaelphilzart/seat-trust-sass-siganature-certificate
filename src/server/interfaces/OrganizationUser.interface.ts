import { RowDataPacket } from 'mysql2';

export interface OrganizationUserRow extends RowDataPacket {
  organization_user_id: string;
  role: string;

  ou_created_at: Date;
  ou_updated_at: Date;

  user_id: string | null;
  email: string | null;
  is_active: number | null;
  user_created_at: Date | null;
  user_updated_at: Date | null;

  organization_id: string | null;
  organization_name: string | null;
  organization_slug: string | null;
  organization_logo: string | null;
  org_created_at: Date | null;
  org_updated_at: Date | null;
}

export interface OrganizationUserIdRow extends RowDataPacket {
  user_id: string;
  organization_id: string;
}

export interface UserCountRow extends RowDataPacket {
  total: number;
}
