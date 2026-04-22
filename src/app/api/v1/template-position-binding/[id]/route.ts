import { NextResponse } from 'next/server';
import { getAllTemplatePositionBindings } from '@/server/services/templatePositionBinding';
// ============================
// (GET)
// ============================
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const batchId = (await params).id;
    const data = await getAllTemplatePositionBindings(batchId);

    return NextResponse.json({ data });
  } catch (e: any) {
    console.error('GET Template Position Binding ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
