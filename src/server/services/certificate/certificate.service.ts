import { pool } from '@/lib/db';
import {
  mapCertificateData,
  mapCertificateDataParticipant,
} from './certificate.mapper';
import sharp from 'sharp';
import QRCode from 'qrcode';
import { buildQrTargetUrl } from '@/utils/qrCode';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import {
  BatchRow,
  TemplatePositionRow,
  BindingRow,
  RepresentativeRow,
  ParticipantRow,
} from '@/server/interfaces/Certificate.interface';

export const downloadCertificate = async (batch_id: string) => {
  if (!batch_id) {
    throw new Error('batch_id is required');
  }

  // =========================
  // 1. TEMPLATE
  // =========================
  const [batchRows] = await pool.query<BatchRow[]>(
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

  const batch = batchRows[0];
  if (!batch) throw new Error('Batch not found');

  // =========================
  // 2. POSITIONS (SOURCE OF TRUTH: batch_id)
  // =========================
  const [positions] = await pool.query<TemplatePositionRow[]>(
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
  // 3. BINDINGS (SOURCE OF TRUTH: batch_id di binding!)
  // =========================
  const [bindings] = await pool.query<BindingRow[]>(
    `
        SELECT 
            template_position_id,
            batch_representative_id
        FROM template_position_bindings
        WHERE batch_id = ?
        `,
    [batch_id]
  );

  // =========================
  // 4. REPRESENTATIVES
  // =========================
  const [reps] = await pool.query<RepresentativeRow[]>(
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

  // =========================
  // 5. MAP DATA
  // =========================
  const mapped = mapCertificateData({
    positions,
    bindings,
    representatives: reps,
  });

  // =========================
  // 6. TEMPLATE LOAD
  // =========================
  const templateRes = await fetch(batch.file_path);
  const templateBuffer = Buffer.from(await templateRes.arrayBuffer());

  // =========================
  // 7. QR BUILD
  // =========================
  const composites = await Promise.all(
    mapped.map(async (item) => {
      const targetUrl = buildQrTargetUrl(item.representative.id);
      if (!targetUrl) return null;

      const qrBuffer = await QRCode.toBuffer(targetUrl, {
        width: item.position.width,
        margin: 0,
        color: {
          dark: '#000000',
          light: '#00000000',
        },
      });

      return {
        input: qrBuffer,
        top: item.position.y,
        left: item.position.x,
      };
    })
  );

  const validComposites = composites.filter(
    (item): item is NonNullable<typeof item> => item !== null
  );

  // =========================
  // 8. COMPOSE
  // =========================
  const finalImage = await sharp(templateBuffer)
    .composite(validComposites)
    .jpeg()
    .toBuffer();

  return finalImage;
};

// =========================
// MAIN SERVICE
// =========================
export const downloadCertificateParticipant = async (
  batch_id: string,
  participant_id: string
) => {
  if (!batch_id) throw new Error('batch_id is required');
  if (!participant_id) throw new Error('participant_id is required');

  // =========================
  // 1. TEMPLATE
  // =========================
  const [batchRows] = await pool.query<BatchRow[]>(
    `
        SELECT b.id, t.file_path
        FROM batches b
        LEFT JOIN templates t ON t.id = b.template_id
        WHERE b.id = ?
        LIMIT 1
        `,
    [batch_id]
  );

  const batch = batchRows[0];
  if (!batch) throw new Error('Batch not found');

  // =========================
  // 2. POSITIONS
  // =========================
  const [positions] = await pool.query<TemplatePositionRow[]>(
    `
        SELECT 
            tp.id,
            tp.x,
            tp.y,
            tp.width,
            tp.height,
            tp.rotation,
            tp.asset_id,
            et.code
        FROM template_positions tp
        LEFT JOIN element_types et ON et.id = tp.element_type_id
        WHERE tp.batch_id = ?
        `,
    [batch_id]
  );

  // =========================
  // 3. BINDINGS (FIXED: NO JOIN FILTER)
  // =========================
  const [bindings] = await pool.query<BindingRow[]>(
    `
        SELECT 
            template_position_id,
            batch_representative_id
        FROM template_position_bindings
        WHERE batch_id = ?
        `,
    [batch_id]
  );

  // =========================
  // 4. REPRESENTATIVES
  // =========================
  const [reps] = await pool.query<RepresentativeRow[]>(
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

  // =========================
  // 5. PARTICIPANT
  // =========================
  const [participantRows] = await pool.query<ParticipantRow[]>(
    `
        SELECT id, name
        FROM participants
        WHERE id = ?
        LIMIT 1
        `,
    [participant_id]
  );

  const participant = participantRows[0];
  if (!participant) throw new Error('Participant not found');

  // =========================
  // 6. FONT ASSET
  // =========================
  const fontRow = positions.find((p) => p.code === 'font');
  // =========================
  // 7. MAP
  // =========================
  const mapped = mapCertificateDataParticipant({
    positions,
    bindings,
    representatives: reps,
    participant,
    fontAssets: fontRow?.asset_id
      ? [
          {
            id: fontRow.asset_id,
            file_path: fontRow.file_path,
          },
        ]
      : [],
  });

  // =========================
  // 8. TEMPLATE
  // =========================
  const templateRes = await fetch(batch.file_path);
  const templateBuffer = Buffer.from(await templateRes.arrayBuffer());

  // =========================
  // 9. COMPOSITE
  // =========================
  const composites = await Promise.all(
    mapped.map(async (item) => {
      if (item.type === 'qr') {
        const targetUrl = buildQrTargetUrl(
          item.representative.representative_id
        );

        if (!targetUrl) return null;

        const qrBuffer = await QRCode.toBuffer(targetUrl, {
          width: item.position.width,
          margin: 0,
          color: {
            dark: '#000',
            light: '#0000',
          },
        });

        return {
          input: qrBuffer,
          top: item.position.y,
          left: item.position.x,
        };
      }

      if (item.type === 'text') {
        const svg = `
                    <svg width="${item.position.width}" height="${item.position.height}">
                        <style>
                            ${
                              item.font_url
                                ? `
                                @font-face {
                                    font-family: customFont;
                                    src: url(${item.font_url});
                                }
                            `
                                : ''
                            }

                            .text {
                                font-family: ${item.font_url ? 'customFont' : 'sans-serif'};
                                font-size: 24px;
                                fill: #000;
                            }
                        </style>

                        <text x="0" y="${item.position.height / 2}" class="text">
                            ${item.text}
                        </text>
                    </svg>
                `;

        return {
          input: Buffer.from(svg),
          top: item.position.y,
          left: item.position.x,
        };
      }

      return null;
    })
  );

  const validComposites = composites.filter(
    (item): item is NonNullable<typeof item> => item !== null
  );

  // =========================
  // 10. FINAL IMAGE
  // =========================
  const finalImage = await sharp(templateBuffer)
    .composite(validComposites)
    .jpeg()
    .toBuffer();

  return finalImage;
};

// BULK
export const downloadCertificateBulk = async (
  batch_id: string,
  participant_ids: string[]
) => {
  if (!batch_id) throw new Error('batch_id is required');
  if (!participant_ids?.length) throw new Error('participant_ids is required');

  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  const stream = new PassThrough();
  archive.pipe(stream);

  // =========================
  // LIMIT CONCURRENCY (IMPORTANT)
  // =========================
  const CONCURRENCY = 5;
  let index = 0;

  const worker = async () => {
    while (index < participant_ids.length) {
      const current = participant_ids[index++];
      if (!current) continue;

      try {
        const buffer = await downloadCertificateParticipant(batch_id, current);

        archive.append(buffer, {
          name: `certificate-${current}.jpg`,
        });
      } catch (err) {
        console.error(`Failed generate for participant ${current}`, err);
      }
    }
  };

  // spawn worker pool
  await Promise.all(Array.from({ length: CONCURRENCY }).map(() => worker()));

  await archive.finalize();

  return stream;
};
