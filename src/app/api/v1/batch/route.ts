import { NextResponse } from 'next/server';
import { createBatch, getAllBatch } from '@/server/services/batchServices';

export async function GET() {
    try {
        return NextResponse.json({ data: await getAllBatch() });
    } catch (e: any) {
        console.error('GET batch ERROR:', e);
        return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
  try {
    const {
      name,
      organization_id,
      template_id,
      start_date,
      end_date,
      status,
    } = await req.json();

    // ✅ validasi wajib
    if (!name || !organization_id || !template_id || !start_date || !end_date) {
      return NextResponse.json(
        {
          message:
            'name, organization_id, template_id, start_date dan end_date wajib diisi',
        },
        { status: 400 }
      );
    }

    const batch = await createBatch({
      name,
      organization_id,
      template_id,
      start_date,
      end_date,
      status: status || 'ACTIVE', // default
    });

    return NextResponse.json(
      {
        message: 'Batch berhasil dibuat',
        data: batch,
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('POST BATCH ERROR:', e);

    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}