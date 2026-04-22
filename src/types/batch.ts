import { IOrganization } from './organization';
import { ITemplate } from './template';

export interface IBatch {
  id?: string;
  organization?: IOrganization | null;
  template?: ITemplate | null;
  name?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  participants_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ICreateBatch {
  id?: string;
  organization_id?: string;
  template_id?: string;
  name?: string;
  start_date?: Date;
  end_date?: Date;
  status?: string;
}

export interface IUpdateBatch {
  id?: string;
  organization_id?: string;
  template_id?: string;
  name?: string;
  start_date?: Date | string;
  end_date?: Date | string;
  status?: string;
}
