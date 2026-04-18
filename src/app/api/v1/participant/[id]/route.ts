import { NextResponse } from 'next/server';
import { getAllParticipants, updateParticipant } from '@/server/services/participantServices';

// ============================
// (GET)
// ============================
export async function GET(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const batchId = (await params).id;
        const data = await getAllParticipants(batchId);

        return NextResponse.json({ data });
    } catch (e: any) {
        console.error('GET Participant ERROR:', e);
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
    const updated = await updateParticipant(id, body);
    if (!updated)
      return NextResponse.json(
        { message: 'Participant tidak ditemukan' },
        { status: 404 }
      );
    return NextResponse.json(
      {
        message: "Participant berhasil diperbarui",
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
