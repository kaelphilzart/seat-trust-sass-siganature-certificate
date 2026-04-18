import { IOrganization } from "./organization";

export interface ITemplate {
    id: string;
    organization?: IOrganization | null;
    name?: string;
    file_path?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface ICreateTemplate {
    id: string,
    organization_id: string;
    name: string;
    file_path: string;
}

export interface IUpdateTemplate {
    id?: string;
    organization_id?: string;
    name?: string;
    file_path?: string ;
}
