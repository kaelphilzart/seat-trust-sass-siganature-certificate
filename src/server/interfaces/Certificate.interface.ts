import { RowDataPacket } from 'mysql2';

/* =========================
   CERTIFICATE QUERY ROWS
========================= */

export interface BatchRow extends RowDataPacket {
  id: string;
  file_path: string;
}

export interface TemplatePositionRow extends RowDataPacket {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  asset_id?: string;
  code?: string;
}

export interface BindingRow extends RowDataPacket {
  template_position_id: string;
  batch_representative_id: string;
}

export interface RepresentativeRow extends RowDataPacket {
  id: string;
  representative_id: string;
  name: string;
  title: string;
}

export interface ParticipantRow extends RowDataPacket {
  id: string;
  name: string;
}
