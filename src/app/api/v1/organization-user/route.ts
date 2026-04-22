import { NextResponse } from 'next/server';
import {
  getAllOrganizationUsers,
  createOrganizationUser,
} from '@/server/services/organizationUserService';

export async function GET() {
  try {
    return NextResponse.json({ data: await getAllOrganizationUsers() });
  } catch (e: any) {
    console.error('GET ORGANIZATION USER ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { user_id, organization_id, role } = await req.json();
    if (!user_id || !organization_id) {
      return NextResponse.json(
        { message: 'user_id and organization_id are required' },
        { status: 400 }
      );
    }
    const organizationUser = await createOrganizationUser({
      user_id,
      organization_id,
      role: role ?? null,
    });
    return NextResponse.json(
      {
        message: 'Organization User berhasil dibuat',
        data: organizationUser,
      },
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
