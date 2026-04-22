import { RowDataPacket } from 'mysql2';

export interface PlanFeatureValueRow extends RowDataPacket {
  plan_feature_value_id: string;
  plan_id: string;
  value: string;
  pfv_created_at: Date;
  pfv_updated_at: Date;

  feature_id: string;
  feature_key: string;
  display_name: string;
  description: string | null;
  feature_type: string;
  category: string | null;
  feature_created_at: Date;
  feature_updated_at: Date;
}
