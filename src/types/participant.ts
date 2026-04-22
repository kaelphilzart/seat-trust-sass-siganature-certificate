import { IBatch } from './batch';

export interface IParticipant {
  id: string;
  batch: IBatch;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
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
