import { RowDataPacket } from 'mysql2';

export interface ParticipantRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;

  batch_id: string;
  batch_name: string;
  status: string;
  start_date: string;
  end_date: string;

  created_at: string;
  updated_at: string;
}

export interface ParticipantBatchRow extends RowDataPacket {
  batch_id: string | null;
}
