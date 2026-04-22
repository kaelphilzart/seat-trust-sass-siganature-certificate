import { IPlanFeatureValue } from '@/types/plan-feature-value';
import { PlanFeatureValueRow } from '../interfaces/PlanFeatureValue.interface';

export const mapPlanFeatureValue = (
  row: PlanFeatureValueRow
): IPlanFeatureValue => {
  return {
    id: row.plan_feature_value_id,
    plan_id: row.plan_id,
    value: row.value,
    created_at: row.pfv_created_at,
    updated_at: row.pfv_updated_at,

    feature: {
      id: row.feature_id,
      feature_key: row.feature_key,
      display_name: row.display_name,
      description: row.description ?? '',
      feature_type: row.feature_type,
      category: row.category ?? '',
    },
  };
};
