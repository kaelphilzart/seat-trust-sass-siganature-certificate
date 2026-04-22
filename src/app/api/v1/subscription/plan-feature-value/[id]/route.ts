import { NextResponse } from 'next/server';
import {
  updatePlanFeatureValue,
  deletePlanFeatureValue,
  createPlanFeatureValueByParam,
  getAllPlanFeatureValues,
} from '@/server/services/planFeatureValue';

// ============================
// (GET)
// ============================
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const planId = (await params).id;
    const data = await getAllPlanFeatureValues(planId);

    return NextResponse.json({ data });
  } catch (e: any) {
    console.error('GET Plan Feature Values ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
// ============================
// (POST)
// ============================
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { feature_id, value } = await req.json();

    if (!feature_id || !value) {
      return NextResponse.json(
        { message: 'feature_id dan value wajib diisi' },
        { status: 400 }
      );
    }

    const data = await createPlanFeatureValueByParam(id, {
      plan_id: id,
      feature_id,
      value,
    });

    return NextResponse.json(
      { message: 'Feature plan berhasil dibuat', data },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('POST PLAN FEATURE VALUE ERROR:', e);

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
    const updated = await updatePlanFeatureValue(id, body);

    if (!updated)
      return NextResponse.json(
        { message: 'Plan feature value tidak ditemukan' },
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
    await deletePlanFeatureValue(id);
    return NextResponse.json({
      success: true,
      message: 'Plan feature berhasil dihapus',
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
