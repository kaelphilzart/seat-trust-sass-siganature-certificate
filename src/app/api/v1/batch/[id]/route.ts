import { NextResponse } from 'next/server';
import {
  getAllBatch,
  deleteBatch,
  updateBatch,
} from '@/server/services/batchServices';

// ============================
// (GET)
// ============================
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizationId = (await params).id;
    const data = await getAllBatch(organizationId);

    return NextResponse.json({ data });
  } catch (e: any) {
    console.error('GET Batch ERROR:', e);
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
    const updated = await updateBatch(id, body);
    if (!updated)
      return NextResponse.json(
        { message: 'Batch tidak ditemukan' },
        { status: 404 }
      );
    return NextResponse.json(
      {
        message: 'Batch berhasil diperbarui',
        data: updated,
      },
      { status: 200 }
    );
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
    await deleteBatch(id);
    return NextResponse.json({
      success: true,
      message: 'Batch berhasil dihapus',
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
