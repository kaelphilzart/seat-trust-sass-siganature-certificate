import { NextResponse } from 'next/server';
import { ICreateSubscription } from '@/types/subscription';
import { getAllSubscriptions, createSubscription } from '@/server/services/subscription';

export async function GET() {
    try {
        return NextResponse.json({ data: await getAllSubscriptions() });
    } catch (e: any) {
        console.error('GET subscriptions ERROR:', e);
        return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
  try {
    const body: ICreateSubscription[] = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { message: 'Data subscriptions harus array dan tidak kosong' },
        { status: 400 }
      );
    }

    // Validasi setiap item
    for (const s of body) {
      if (!s.organization_id || !s.plan_id || !s.start_date || !s.end_date) {
        return NextResponse.json(
          { message: 'Setiap item harus memiliki organization_id, plan_id, start_date, dan end_date' },
          { status: 400 }
        );
      }
    }

    const inserted = await createSubscription(body);

    return NextResponse.json(
      {
        message: 'Subscriptions berhasil dibuat',
        data: inserted,
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('POST SUBSCRIPTION ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}