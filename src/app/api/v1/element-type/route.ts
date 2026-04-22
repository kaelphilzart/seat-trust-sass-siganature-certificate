import { NextResponse } from 'next/server';
import {
  createElementType,
  getAllElementTypes,
} from '@/server/services/elementTypeServices';
import { uploadToCloudinaryElement } from '@/server/services/upload';

export async function GET() {
  try {
    return NextResponse.json({ data: await getAllElementTypes() });
  } catch (e: any) {
    console.error('GET ELEMENT ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;

    const default_width = formData.get('default_width');
    const default_height = formData.get('default_height');
    const default_rotation = formData.get('default_rotation');

    // ✅ NEW
    const feature_key = formData.get('feature_key') as string | null;
    const ui_type = formData.get('ui_type') as string | null;
    const element_kind = formData.get('element_kind') as string | null;
    const asset_type = formData.get('asset_type') as string | null;

    if (!file || !name) {
      return NextResponse.json(
        { message: 'File dan name wajib diisi' },
        { status: 400 }
      );
    }

    // ========================
    // Upload ke Cloudinary
    // ========================
    const bytes = await file.arrayBuffer();
    const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`;
    const upload = await uploadToCloudinaryElement(base64);

    // ========================
    // PARSE NUMBER
    // ========================
    const parsedWidth =
      default_width !== null ? Number(default_width) : undefined;

    const parsedHeight =
      default_height !== null ? Number(default_height) : undefined;

    const parsedRotation =
      default_rotation !== null ? Number(default_rotation) : undefined;

    // ========================
    // SIMPAN DB
    // ========================
    const element = await createElementType({
      name,
      code,
      icon_path: upload.url,
      default_width: parsedWidth,
      default_height: parsedHeight,
      default_rotation: parsedRotation,

      // ✅ NEW
      feature_key: feature_key || undefined,
      ui_type: ui_type || undefined,
      element_kind: element_kind || undefined,
      asset_type: asset_type || undefined,
    });

    return NextResponse.json(
      {
        message: 'Element Type berhasil dibuat',
        data: element,
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('POST ELEMENT TYPE ERROR:', e);

    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
