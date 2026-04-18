import { NextResponse } from 'next/server';
import { getAllRepresentatives, deleteRepresentative, updateRepresentative, getRepresentativeById } from '@/server/services/representative';

// ============================
// (GET)
// ============================
// export async function GET(
//   _: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const organizationId = (await params).id;
//     const data = await getAllRepresentatives(organizationId);

//     return NextResponse.json({ data });
//   } catch (e: any) {
//     console.error('GET Organization Asset ERROR:', e);
//     return NextResponse.json(
//       { message: e?.message || 'Server error' },
//       { status: 500 }
//     );
//   }
// }
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const representative = await getRepresentativeById(id);

    if (!representative)
      return NextResponse.json({ message: 'Representative tidak ditemukan' }, { status: 404 });

    return NextResponse.json(representative);
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
    const updated = await updateRepresentative(id, body);
    if (!updated)
      return NextResponse.json(
        { message: 'Representative tidak ditemukan' },
        { status: 404 }
      );
    return NextResponse.json(
      {
        message: "Representative berhasil diperbarui",
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
    await deleteRepresentative(id);
    return NextResponse.json({ success: true, message: 'Representative berhasil dihapus' });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}