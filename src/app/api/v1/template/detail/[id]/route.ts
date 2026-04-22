import { NextResponse } from 'next/server';
import { getTemplateById } from '@/server/services/template';

// ============================
// GET BY ID
// ============================
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plan = await getTemplateById(id);

    if (!plan)
      return NextResponse.json(
        { message: 'Template tidak ditemukan' },
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
