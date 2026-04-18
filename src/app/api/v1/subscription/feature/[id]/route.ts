import { NextResponse } from 'next/server';
import { getFeatureById, updateFeature, deleteFeature } from '@/server/services/featureService';

// ============================
// GET BY ID
// ============================
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const feature = await getFeatureById(id);

    if (!feature)
      return NextResponse.json({ message: 'Fitur tidak ditemukan' }, { status: 404 });

    return NextResponse.json(feature);
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
    const updated = await updateFeature(id, body);

    if (!updated)
      return NextResponse.json({ message: 'fitur tidak ditemukan' }, { status: 404 });

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
    await deleteFeature(id);
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 });
  }
}