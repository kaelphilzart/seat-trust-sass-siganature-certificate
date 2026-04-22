import { NextResponse } from 'next/server';
import { getAllUsers, createUser } from '@/server/services/userService';

export async function GET() {
  try {
    return NextResponse.json({ data: await getAllUsers() });
  } catch (e: any) {
    console.error('GET USER ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json(
        { message: 'Email dan password wajib diisi' },
        { status: 400 }
      );

    const u = await createUser({ email, password });

    return NextResponse.json(
      {
        id: u.id,
        email: u.email,
        is_active: u.is_active,
        created_at: u.created_at,
        updated_at: u.updated_at,
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('POST USER ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
