import { IParticipant } from '@/types/participant';
import { ParticipantRow } from '../interfaces/Participant.interface';

export const mapParticipant = (row: ParticipantRow): IParticipant => {
  return {
    id: row.id,
    name: row.name,
    email: row.email,

    batch: {
      id: row.batch_id,
      name: row.batch_name,
      status: row.status,
      start_date: row.start_date,
      end_date: row.end_date,
    },

    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};
