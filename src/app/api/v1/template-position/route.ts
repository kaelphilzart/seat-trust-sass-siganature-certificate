import { NextResponse } from 'next/server';
import { upsertTemplatePositionsBulk, getAllTemplatePositions, updateTemplatePositionsBulk } from '@/server/services/templatePosition';

export async function GET() {
    try {
        return NextResponse.json({ data: await getAllTemplatePositions() });
    } catch (e: any) {
        console.error('GET template position ERROR:', e);
        return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 });
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
            return NextResponse.json(
                { message: "Payload kosong" },
                { status: 400 }
            );
        }

        // =========================
        // VALIDATION MINIMAL
        // =========================
        for (const item of payloads) {
            if (!item.batch_id || !item.element_type_id) {
                return NextResponse.json(
                    { message: "batch_id & element_type_id wajib" },
                    { status: 400 }
                );
            }
        }

        // =========================
        // FULL SYNC ENGINE
        // (create + update + delete)
        // =========================
        await upsertTemplatePositionsBulk(payloads);

        return NextResponse.json(
            {
                message: "Canvas synced successfully",
            },
            { status: 201 }
        );
    } catch (e: any) {
        console.error("SYNC ERROR:", e);

        return NextResponse.json(
            {
                message: e?.message || "Server error",
            },
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