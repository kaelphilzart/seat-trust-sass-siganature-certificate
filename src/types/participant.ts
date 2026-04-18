import { IBatch } from "./batch";

export interface IParticipant {
    id: string;
    batch: IBatch;
    name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateParticipant {
    batch_id: string;
    name: string;
    email: string;
}

export interface IUpdateParticipant {
    id: string;
    batch_id?: string;
    name?: string;
    email?: string;
}