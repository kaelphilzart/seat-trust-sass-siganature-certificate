import { RowDataPacket } from 'mysql2';

export interface SubscriptionRow extends RowDataPacket {
  subscription_id: string;
  subscription_organization_id: string;
  subscription_plan_id: string;

  start_date: Date;
  end_date: Date;
  status: number; // biasanya dari MySQL tinyint(1)

  subscription_created_at: Date;
  subscription_updated_at: Date;

  // organization
  org_id: string;
  org_name: string;
  org_slug: string;
  org_logo: string;

  // plan
  plan_id: string;
  plan_name: string;
  plan_price: number;
}
