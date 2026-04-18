import { NextResponse } from 'next/server';
import { createPlan, getAllPlans } from '@/server/services/planService';

export async function GET() {
    try {
        return NextResponse.json({ data: await getAllPlans() });
    } catch (e: any) {
        console.error('GET PLANS ERROR:', e);
        return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, price } =
            await req.json();
        if (!name || !price) {
            return NextResponse.json(
                { message: 'name dan price wajib diisi' },
                { status: 400 }
            );
        }
        const plan = await createPlan({ name, price,});
        return NextResponse.json(
            {
                message: 'Plan berhasil dibuat',
                data: plan,
            },
            { status: 201 }
        );
    } catch (e: any) {
        console.error('POST PLAN ERROR:', e);

        return NextResponse.json(
            { message: e?.message || 'Server error' },
            { status: 500 }
        );
    }
}