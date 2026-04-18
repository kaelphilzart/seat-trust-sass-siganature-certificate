export interface User {
    id: string;
    email?: string | null;
    password?: string | null;
    is_active: boolean;
    last_login?: Date | null;
    created_at: Date;
    updated_at: Date;
}