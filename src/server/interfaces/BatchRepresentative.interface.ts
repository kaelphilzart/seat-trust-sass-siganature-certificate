import { RowDataPacket } from 'mysql2';

export interface BatchRepresentativeRow extends RowDataPacket {
  id: string;

  batch_id: string;
  batch_name: string;
  start_date: Date;
  end_date: Date;

  representative_id: string | null;
  representative_name: string | null;
  representative_title: string | null;

  created_at: Date;
  updated_at: Date;
}

export interface BatchRepresentativeExistingRow extends RowDataPacket {
  id: string;
  representative_id: string;
}

export interface BatchIdRow extends RowDataPacket {
  batch_id: string;
}
