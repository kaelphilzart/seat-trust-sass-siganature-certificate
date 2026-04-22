import { NextResponse } from 'next/server';
import {
  getAllBatchRepresentatives,
  upsertBatchRepresentativesBulk,
  deleteBatchRepresentativesBulk,
} from '@/server/services/batchRepresentativeServices';

export async function GET() {
  try {
    return NextResponse.json({ data: await getAllBatchRepresentatives() });
  } catch (e: any) {
    console.error('GET batch representative ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}

// ============================
// (UPsert: POST + PATCH)
// ============================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const payloads = Array.isArray(body) ? body : [body];

    if (!payloads.length) {
      return NextResponse.json({ message: 'Payload kosong' }, { status: 400 });
    }

    // =========================
    // VALIDATION
    // =========================
    for (const item of payloads) {
      if (!item.batch_id || !item.representative_id) {
        return NextResponse.json(
          { message: 'batch_id & representative_id wajib' },
          { status: 400 }
        );
      }
    }

    // =========================
    // FULL SYNC
    // =========================
    await upsertBatchRepresentativesBulk(payloads);

    return NextResponse.json(
      {
        message: 'Batch representatives synced successfully',
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('SYNC BATCH REPRESENTATIVE ERROR:', e);

    return NextResponse.json(
      {
        message: e?.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

//delete
export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const ids: string[] = body?.ids || [];

    if (!ids.length) {
      return NextResponse.json({ message: 'IDs wajib diisi' }, { status: 400 });
    }

    await deleteBatchRepresentativesBulk(ids);

    return NextResponse.json(
      {
        message: 'Batch representatives deleted successfully',
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error('DELETE BATCH REPRESENTATIVE ERROR:', e);

    return NextResponse.json(
      {
        message: e?.message || 'Server error',
      },
      { status: 500 }
    );
  }
}
