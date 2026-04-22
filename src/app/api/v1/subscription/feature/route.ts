import { NextResponse } from 'next/server';
import {
  getAllFeatures,
  createFeature,
} from '@/server/services/featureService';

export async function GET() {
  try {
    return NextResponse.json({ data: await getAllFeatures() });
  } catch (e: any) {
    console.error('GET FEATURE ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { feature_key, display_name, description, feature_type, category } =
      await req.json();
    if (!feature_key || !display_name || !feature_type) {
      return NextResponse.json(
        { message: 'feature_key, display_name, dan feature_type wajib diisi' },
        { status: 400 }
      );
    }
    const feature = await createFeature({
      feature_key,
      display_name,
      description: description ?? null,
      feature_type,
      category: category ?? null,
    });
    return NextResponse.json(
      {
        message: 'Feature berhasil dibuat',
        data: feature,
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
