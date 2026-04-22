import { NextResponse } from 'next/server';
import { getAllTemplates, deleteTemplate } from '@/server/services/template';

// ============================
// (GET)
// ============================
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizationId = (await params).id;
    const data = await getAllTemplates(organizationId);

    return NextResponse.json({ data });
  } catch (e: any) {
    console.error('GET Template ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}

// ============================
// (PATCH)
// ============================
// export async function PATCH(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const body = await req.json();
//     const updated = await updateOrganizationUser(id, body);
//     if (!updated)
//       return NextResponse.json(
//         { message: 'Organization user tidak ditemukan' },
//         { status: 404 }
//       );
//     return NextResponse.json(
//       {
//         message: "Organization user berhasil diperbarui",
//         data: updated,
//       },
//       { status: 200 }
//     );
//   } catch (e: any) {
//     return NextResponse.json(
//       { message: e?.message || 'Server error' },
//       { status: 500 }
//     );
//   }
// }
// ============================
// DELETE
// ============================
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await deleteTemplate(id);
    return NextResponse.json({
      success: true,
      message: 'Template berhasil dihapus',
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
