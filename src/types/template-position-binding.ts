import { ITemplatePosition } from './template-position';
import { IBatchRepresentative } from './batch-representative';

export interface ITemplatePositionBinding {
  id: string;
  batch_id?: string;
  templatePosition: ITemplatePosition | null;
  batchRepresentative: IBatchRepresentative | null;
  created_at: string;
  updated_at: string;
}

export interface ICreateTemplatePositionBinding {
  batch_id: string;
  template_position_id: string;
  batch_representative_id: string;
}

export interface IUpdateTemplatePositionBinding {
  id?: string;
  batch_id: string;
  template_position_id?: string;
  batch_representative_id?: string;
}
