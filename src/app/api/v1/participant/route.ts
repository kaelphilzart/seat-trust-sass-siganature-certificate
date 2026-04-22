import { NextResponse } from 'next/server';
import {
  getAllParticipants,
  deleteParticipantsBulk,
  createParticipantsBulk,
} from '@/server/services/participantServices';

export async function GET() {
  try {
    return NextResponse.json({ data: await getAllParticipants() });
  } catch (e: any) {
    console.error('GET participant ERROR:', e);
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
      if (!item.batch_id || !item.name || !item.email) {
        return NextResponse.json(
          { message: 'batch_id, name & email wajib diisi' },
          { status: 400 }
        );
      }
    }

    // =========================
    // OPTIONAL: CEK CONSISTENCY BATCH
    // (biar 1 request = 1 batch)
    // =========================
    const batchId = payloads[0].batch_id;

    if (!payloads.every((p) => p.batch_id === batchId)) {
      return NextResponse.json(
        { message: 'Semua participant harus dalam batch yang sama' },
        { status: 400 }
      );
    }

    // =========================
    // BULK CREATE
    // =========================
    await createParticipantsBulk(payloads);

    return NextResponse.json(
      {
        message: 'Participants created successfully',
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('CREATE PARTICIPANTS ERROR:', e);

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

    await deleteParticipantsBulk(ids);

    return NextResponse.json(
      {
        message: 'Participants deleted successfully',
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error('DELETE PARTICIPANT ERROR:', e);

    return NextResponse.json(
      {
        message: e?.message || 'Server error',
      },
      { status: 500 }
    );
  }
}
