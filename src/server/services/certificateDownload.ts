import { pool } from '@/lib/db';

export const downloadCertificate = async (batch_id: string) => {
    if (!batch_id) {
        throw new Error('batch_id is required');
    }

    // =========================
    // 1. GET TEMPLATE
    // =========================
    const [batchRows] = await pool.query(
        `
        SELECT 
            b.id,
            t.file_path
        FROM batches b
        LEFT JOIN templates t ON t.id = b.template_id
        WHERE b.id = ?
        LIMIT 1
        `,
        [batch_id]
    );

    const batch = (batchRows as any[])[0];
    if (!batch) throw new Error('Batch not found');

    // =========================
    // 2. GET TEMPLATE POSITIONS (QR ONLY)
    // =========================
    const [positions] = await pool.query(
        `
        SELECT 
            tp.id,
            tp.x,
            tp.y,
            tp.width,
            tp.height,
            tp.rotation
        FROM template_positions tp
        WHERE tp.batch_id = ?
        `,
        [batch_id]
    );

    // =========================
    // 3. GET BINDINGS
    // =========================
    const [bindings] = await pool.query(
        `
        SELECT 
            tpb.template_position_id,
            tpb.batch_representative_id
        FROM template_position_bindings tpb
        `,
    );

    // =========================
    // 4. GET REPRESENTATIVES
    // =========================
    const [reps] = await pool.query(
        `
        SELECT 
            br.id,
            br.representative_id,

            r.name,
            r.title

        FROM batch_representatives br
        LEFT JOIN representatives r 
            ON r.id = br.representative_id

        WHERE br.batch_id = ?
        `,
        [batch_id]
    );

    return {
        template: batch.file_path,
        positions,
        bindings,
        representatives: reps,
    };
};
