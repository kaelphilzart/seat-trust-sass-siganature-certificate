import { NextResponse } from 'next/server';
import { getBatchById } from '@/server/services/batchServices';

// ============================
// GET BY ID
// ============================
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plan = await getBatchById(id);

    if (!plan)
      return NextResponse.json(
        { message: 'Batch tidak ditemukan' },
        { status: 404 }
      );

    return NextResponse.json(plan);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
