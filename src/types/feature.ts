export interface IFeature {
    id?: string;
    feature_key?: string;
    display_name?: string;
    description?: string;
    feature_type?: string;
    category?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface ICreateFeature {
    id? : string;
    feature_key: string;
    display_name: string;
    description?: string | null;
    feature_type: string;
    category?: string | null;
}

export interface IUpdateFeature {
    id?: string;
    feature_key?: string;
    display_name?: string;
    description?: string;
    feature_type?: string;
    category?: string;
}