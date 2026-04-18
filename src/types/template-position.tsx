import { IOrganizationAsset } from "./organization"

export interface ITemplatePosition {
    id?: string;
    batch_id?: string;
    element_type_id?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
    asset?: IOrganizationAsset;
    font_size?: number ;
    font_weight?: string ;
    created_at?: Date;
    updated_at?: Date;
}

export interface ICreateTemplatePosition {
    batch_id?: string;
    element_type_id?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
    asset_id?: string;
    font_size?: number ;
    font_weight?: string ;
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
    font_size?: number ;
    font_weight?: string ;
}