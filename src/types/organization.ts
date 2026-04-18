import { ISubscription } from "./subscription";


//---------------------------------------------------------
//ORGANIZATION
export interface IOrganization {
    id?: string;
    name?: string;
    slug?: string;
    logo?: string | null;
    subscription?: ISubscription | null;
    created_at?: Date;
    updated_at?: Date;
}

export interface IOrganizationPrimary {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateOrganization {
    id?: string;
    name?: string;
    slug?: string;
    logo?: string | null;
}

export interface IUpdateOrganization {
    id?: string;
    name?: string;
    slug?: string;
    logo?: string | null;
}

//---------------------------------------------------------
//ORGANIZATION ASSET

export type AssetType = 'IMAGE' | 'FONT' | 'LOGO';

export interface IOrganizationAsset {
    id?: string;
    name?: string;
    organization?: IOrganization;
    type?: string;
    file_path?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface ICreateOrganizationAsset {
    name?: string;
    organization_id?: string;
    type?: string;
    file_path?: string;
    file?: File;
}

export interface IUpdateOrganizationAsset {
    id?: string;
    name?: string;
    organization_id?: string;
    type?: string;
    file_path?: string;
    file?: File;
}
