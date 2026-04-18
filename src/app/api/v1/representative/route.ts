import { NextResponse } from 'next/server';
import { getAllRepresentatives, createRepresentative } from '@/server/services/representative';

export async function GET() {
    try {
        return NextResponse.json({ data: await getAllRepresentatives() });
    } catch (e: any) {
        console.error('GET REPRESENTATIVE ERROR:', e);
        return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, title, organization_id } = await req.json();
        if (!name || !title || !organization_id) {
            return NextResponse.json(
                { message: 'Name, title, and organization_id are required' },
                { status: 400 }
            );
        }
        const representative = await createRepresentative({
            name,
            title,
            organization_id
        });
        return NextResponse.json(
            {
                message: 'Representative berhasil dibuat',
                data: representative,
            },
            { status: 201 }
        );
    } catch (e: any) {
        console.error('POST REPRESENTATIVE ERROR:', e);

        return NextResponse.json(
            { message: e?.message || 'Server error' },
            { status: 500 }
        );
    }
}