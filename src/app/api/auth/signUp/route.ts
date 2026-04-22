import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    // cek apakah email sudah terdaftar
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    const userId = randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user saja
    await db.query(
      `INSERT INTO users 
        (id, email, password, is_active, created_at, updated_at)
       VALUES 
        (?, ?, ?, true, NOW(), NOW())`,
      [userId, email, hashedPassword]
    );

    return NextResponse.json({ message: 'Signup berhasil' }, { status: 201 });
  } catch (error) {
    console.error('SIGNUP ERROR:', error);

    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
