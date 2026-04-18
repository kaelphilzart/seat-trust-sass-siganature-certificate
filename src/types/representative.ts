import { IOrganization } from "./organization";
export interface IRepresentative {
    id: string;
    organization?: IOrganization |null; 
    name: string;
    title: string;
    created_at?: string;
    updated_at?: string;
}

export interface ICreateRepresentative {
    organization_id?: string;
    name: string;
    title: string;
}

export interface IUpdateRepresentative {
    id?: string;
    organization_id?: string;
    name?: string;
    title?: string;
}