import { IBatch } from './batch';
import { IRepresentative } from './representative';

export interface IBatchRepresentative {
  id: string;
  batch: IBatch | null;
  representative: IRepresentative | null;
  created_at: string;
  updated_at: string;
}

export interface ICreateBatchRepresentative {
  batch_id: string;
  representative_id: string;
}

export interface IUpdateBatchRepresentative {
  id: string;
  batch_id?: string;
  representative_id?: string;
}
