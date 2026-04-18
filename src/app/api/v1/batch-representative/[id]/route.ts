import { NextResponse } from 'next/server';
import { getAllBatchRepresentatives } from '@/server/services/batchRepresentativeServices';

// ============================
// (GET)
// ============================
export async function GET(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const batchId = (await params).id;
        const data = await getAllBatchRepresentatives(batchId);

        return NextResponse.json({ data });
    } catch (e: any) {
        console.error('GET Batch Representative ERROR:', e);
        return NextResponse.json(
            { message: e?.message || 'Server error' },
            { status: 500 }
        );
    }
}
