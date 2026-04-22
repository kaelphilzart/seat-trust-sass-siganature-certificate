import { NextResponse } from 'next/server';
import { getAllTemplatePositions } from '@/server/services/templatePosition';

// ============================
// (GET)
// ============================
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const batchId = (await params).id;
    const data = await getAllTemplatePositions(batchId);

    return NextResponse.json({ data });
  } catch (e: any) {
    console.error('GET Template Position ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
