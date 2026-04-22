import { NextResponse } from 'next/server';
import {
  getAllOrganizationUsers,
  createOrganizationUserByParam,
  updateOrganizationUser,
  deleteOrganizationUser,
} from '@/server/services/organizationUserService';

// ============================
// (GET)
// ============================
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizationUserId = (await params).id;
    const data = await getAllOrganizationUsers(organizationUserId);

    return NextResponse.json({ data });
  } catch (e: any) {
    console.error('GET Organization User ERROR:', e);
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
    const { user_id, role, organization_id } = await req.json();

    if (!user_id || !role) {
      return NextResponse.json(
        { message: 'user_id dan value wajib diisi' },
        { status: 400 }
      );
    }

    const data = await createOrganizationUserByParam(id, {
      user_id,
      organization_id,
      role,
    });

    return NextResponse.json(
      { message: 'Organization user berhasil dibuat', data },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('POST ORGANIZATION USER ERROR:', e);

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
    const updated = await updateOrganizationUser(id, body);
    if (!updated)
      return NextResponse.json(
        { message: 'Organization user tidak ditemukan' },
        { status: 404 }
      );
    return NextResponse.json(
      {
        message: 'Organization user berhasil diperbarui',
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
    await deleteOrganizationUser(id);
    return NextResponse.json({
      success: true,
      message: 'Organization user berhasil dihapus',
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
