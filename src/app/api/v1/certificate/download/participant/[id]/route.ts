import { NextResponse } from 'next/server';
import {
  downloadCertificateBulk,
  downloadCertificateParticipant,
} from '@/server/services/certificate/certificate.service';

// ============================
// (GET)
// ============================
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const batchId = (await params).id;
    const { searchParams } = new URL(req.url);

    const participantIds = searchParams.getAll('participant_id');

    if (!participantIds.length) {
      return NextResponse.json(
        { message: 'participant_ids is required' },
        { status: 400 }
      );
    }

    // 🔥 FIX DI SINI
    if (participantIds.length === 1) {
      const buffer = await downloadCertificateParticipant(
        batchId,
        participantIds[0]
      );

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Disposition': `attachment; filename=certificate-${participantIds[0]}.jpg`,
        },
      });
    }

    // =========================
    // BULK → ZIP
    // =========================
    const zipStream = await downloadCertificateBulk(batchId, participantIds);

    return new NextResponse(zipStream as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=certificates-${batchId}.zip`,
      },
    });
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
