import { RowDataPacket } from 'mysql2';

/**
 * =========================
 * RAW ROW FROM SQL (JOIN RESULT)
 * =========================
 */
export interface TemplatePositionBindingRow extends RowDataPacket {
  id: string;
  batch_id: string;

  template_position_id: string | null;
  template_batch_id: string | null;

  batch_representative_id: string | null;

  batch_name: string | null;

  representative_id: string | null;
  representative_name: string | null;
  representative_title: string | null;

  created_at: string;
  updated_at: string;
}
/**
 * =========================
 * EXISTING ROW (FOR UPSERT LOGIC)
 * =========================
 */
export interface ExistingTemplateBindingRow extends RowDataPacket {
  id: string;
  template_position_id: string;
  batch_representative_id: string;
}

/**
 * =========================
 * INSERT BULK TUPLE
 * =========================
 */
export type InsertTemplateBindingTuple = [
  string, // id
  string, // batch_id
  string, // template_position_id
  string, // batch_representative_id
];
