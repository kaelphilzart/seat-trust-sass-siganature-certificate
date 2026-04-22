export interface IElementType {
  id: string;
  code: string;
  name: string;
  feature_key: string;
  ui_type: string;
  asset_type: string;
  element_kind: string;
  default_width: number;
  default_height: number;
  default_rotation: number;
  icon_path: string;
  created_at: Date;
  updated_at: Date;
}

export const UI_TYPE_OPTIONS = ['element', 'asset'] as const;
export const ELEMENT_KIND_OPTIONS = ['text', 'image', 'qr'] as const;
export const ASSET_TYPE_OPTIONS = ['font', 'image', 'logo'] as const;

export interface ICreateElementType {
  id?: string;
  code?: string;
  name?: string;
  feature_key?: string;
  ui_type?: string;
  element_kind?: string;
  asset_type?: string;
  default_width?: number;
  default_height?: number;
  default_rotation?: number;
  icon_path?: string;
  file_path?: File;
}

export interface IUpdateElementType {
  id?: string;
  code?: string;
  name?: string;
  feature_key?: string;
  ui_type?: string;
  element_kind?: string;
  asset_type?: string;
  default_width?: number;
  default_height?: number;
  default_rotation?: number;
  icon_path?: string;
  file_path?: File;
}
