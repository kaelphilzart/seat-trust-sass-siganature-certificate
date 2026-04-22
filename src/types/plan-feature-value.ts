import { IFeature } from './feature';

export interface IPlanFeatureValue {
  id: string;
  plan_id: string;
  feature: IFeature;
  value: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICreatePlanFeatureValue {
  id?: string;
  plan_id?: string;
  feature_id: string;
  value: string;
}

export interface IUpdatePlanFeatureValue {
  id?: string;
  plan_id?: string;
  feature_id?: string;
  feature?: IFeature;
  value?: string;
}
