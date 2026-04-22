import { NextResponse } from 'next/server';
import { downloadCertificate } from '@/server/services/certificate/certificate.service';

// ============================
// (GET)
// ============================
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const batchId = (await params).id;

    const buffer = await downloadCertificate(batchId);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename=certificate-${batchId}.jpg`,
      },
    });
  } catch (e: any) {
    console.error('Download Certificate ERROR:', e);

    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
