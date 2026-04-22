import { NextResponse } from 'next/server';
import {
  getAllPlanFeatureValues,
  createPlanFeatureValues,
} from '@/server/services/planFeatureValue';
import { ICreatePlanFeatureValue } from '@/types/plan-feature-value';

export async function GET() {
  try {
    return NextResponse.json({ data: await getAllPlanFeatureValues() });
  } catch (e: any) {
    console.error('GET Plan Feature Values ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body: ICreatePlanFeatureValue[] = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { message: 'Data feature values harus array dan tidak kosong' },
        { status: 400 }
      );
    }

    // Validasi setiap item
    for (const pfv of body) {
      if (!pfv.plan_id || !pfv.feature_id || pfv.value == null) {
        return NextResponse.json(
          {
            message:
              'Setiap item harus memiliki plan_id, feature_id, dan value',
          },
          { status: 400 }
        );
      }
    }

    const inserted = await createPlanFeatureValues(body);

    return NextResponse.json(
      {
        message: 'Feature values berhasil dibuat',
        data: inserted,
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('POST FEATURE ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
