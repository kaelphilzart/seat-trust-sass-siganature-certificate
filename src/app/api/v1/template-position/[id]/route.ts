import { NextResponse } from 'next/server';
import { getAllTemplatePositions, deleteTemplatePosition, updateTemplatePositionsBulk } from '@/server/services/templatePosition';

// ============================
// (GET)
// ============================
export async function GET(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const batchId = (await params).id;
        const data = await getAllTemplatePositions(batchId);

        return NextResponse.json({ data });
    } catch (e: any) {
        console.error('GET Template Position ERROR:', e);
        return NextResponse.json(
            { message: e?.message || 'Server error' },
            { status: 500 }
        );
    }
}


// ============================
// (PATCH)
// ============================
export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    // 🔥 samain kayak POST → paksa array
    const payloads = Array.isArray(body) ? body : [body];

    if (!payloads.length) {
      return NextResponse.json(
        { message: 'Payload kosong' },
        { status: 400 }
      );
    }

    // ✅ validasi wajib (id harus ada buat update)
    for (const item of payloads) {
      if (!item.id) {
        return NextResponse.json(
          { message: 'id wajib untuk update' },
          { status: 400 }
        );
      }
    }

    await updateTemplatePositionsBulk(payloads);

    return NextResponse.json(
      {
        message: 'Template positions berhasil diupdate (bulk)',
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error('PATCH TEMPLATE POSITION BULK ERROR:', e);

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
        await deleteTemplatePosition(id);
        return NextResponse.json({ success: true, message: 'Template position berhasil dihapus' });
    } catch (e: any) {
        return NextResponse.json(
            { success: false, message: e?.message || 'Server error' },
            { status: 500 }
        );
    }
}