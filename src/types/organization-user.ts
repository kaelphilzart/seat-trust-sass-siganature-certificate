import { IUser } from './user'
import { IOrganization } from './organization';

export interface IOrganizationUser {
    id?: string;
    user?: IUser | null;
    organization?: IOrganization | null;
    role: string;
    created_at?: Date;
    updated_at?: Date;
}


export interface ICreateOrganizationUser {
    id?: string;
    user_id: string;
    organization_id: string;
    role: string;
}

export interface IUpdateOrganizationUser {
    id?: string;
    user_id?: string;
    organization_id?: string;
    role?: string;
    email?: string;
    password?: string;
}
