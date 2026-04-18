export interface IPlan {
    id?: string;
    name?: string;
    price?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface ICreatePlan {
    id? : string;
    name: string;
    price: number;
}

export interface IUpdatePlan {
    id?: string;
    name?: string;
    price?: number;
}
