import { NextResponse } from 'next/server';
import {
  getPlanById,
  updatePlan,
  deletePlan,
} from '@/server/services/planService';

// ============================
// GET BY ID
// ============================
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plan = await getPlanById(id);

    if (!plan)
      return NextResponse.json(
        { message: 'Plan tidak ditemukan' },
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

// ============================
// (PATCH)
// ============================
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updatePlan(id, body);

    if (!updated)
      return NextResponse.json(
        { message: 'Plan tidak ditemukan' },
        { status: 404 }
      );

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
// ============================
// DELETE
// ============================
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await deletePlan(id);
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
