export interface IUser {
    id: string;
    email: string;
    password?: string;
    is_active: boolean;
    last_login?: Date;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateUser {
    email: string;
    password: string;
}

export interface IUpdateUser {
    id?: string;
    email?: string;
    password?: string;
}

