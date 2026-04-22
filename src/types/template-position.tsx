import { IOrganizationAsset } from './organization';
import { IElementType } from './element-type';

export interface ITemplatePosition {
  id: string;
  batch_id: string;
  element_type_id?: string;
  element_type?: IElementType;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  asset?: IOrganizationAsset | null;
  font_size?: number | null;
  font_weight?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ICreateTemplatePosition {
  id?: string;
  batch_id?: string;
  element_type_id: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  asset_id?: string;
  font_size?: number;
  font_weight?: string;
}

export interface IUpdateTemplatePosition {
  id?: string;
  batch_id?: string;
  element_type_id?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  asset_id?: string;
  font_size?: number;
  font_weight?: string;
}
