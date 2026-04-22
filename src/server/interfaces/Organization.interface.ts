import { RowDataPacket } from 'mysql2';

export interface OrganizationRow extends RowDataPacket {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
  updated_at: Date;

  subscription_id: string | null;
  subscription_org_id: string | null;

  plan_id: string | null;
  plan_name: string | null;
  plan_price: number | null;

  start_date: Date | null;
  end_date: Date | null;
  status: number | null;

  sub_created_at: Date | null;
  sub_updated_at: Date | null;
}
