import { IOrganization } from './organization';
import { IPlan } from './plan';

export interface ISubscription {
  id: string;
  plan_id?: string;
  organization_id?: string;
  organization?: IOrganization | null;
  plan: IPlan;
  start_date: Date;
  end_date: Date;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateSubscription {
  id?: string;
  organization_id?: string;
  plan_id: string;
  start_date: Date;
  end_date: Date;
  status: boolean;
}

export interface IUpdateSubscription {
  id?: string;
  organization_id?: string;
  plan_id?: string;
  start_date?: Date;
  end_date?: Date;
  status?: boolean;
}
