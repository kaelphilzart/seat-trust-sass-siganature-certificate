import { NextResponse } from 'next/server';
import {
  getAllOrganizationsAssets,
  deleteOrganizationAsset,
  updateOrganizationAsset,
} from '@/server/services/organizationAssetServices';
import { uploadToCloudinaryOrganizationAsset } from '@/server/services/upload';
import { AssetType } from '@/types/organization';

// ============================
// (GET)
// ============================
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizationId = (await params).id;
    const data = await getAllOrganizationsAssets(organizationId);

    return NextResponse.json({ data });
  } catch (e: any) {
    console.error('GET Organization Asset ERROR:', e);
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
    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    const name = formData.get('name') as string | null;
    const type_raw = formData.get('type') as string | null;

    const data: any = {};

    // ========================
    // STRING FIELD
    // ========================
    if (name !== null && name !== '') {
      data.name = name;
    }

    // ========================
    // TYPE FIELD (ENUM)
    // ========================
    if (
      type_raw !== null &&
      type_raw !== '' &&
      ['IMAGE', 'FONT', 'LOGO'].includes(type_raw)
    ) {
      data.type = type_raw as AssetType;
    }

    // ========================
    // FILE UPLOAD
    // ========================
    if (file) {
      let detectedType: AssetType = 'IMAGE';

      if (file.type.startsWith('image/')) {
        detectedType = 'IMAGE';
      } else if (
        file.type.includes('font') ||
        file.name.endsWith('.ttf') ||
        file.name.endsWith('.woff') ||
        file.name.endsWith('.woff2')
      ) {
        detectedType = 'FONT';
      }

      const bytes = await file.arrayBuffer();
      const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`;

      const upload = await uploadToCloudinaryOrganizationAsset(base64);

      data.file_path = upload.url;

      // kalau user ga set type → pakai auto detect
      if (!data.type) {
        data.type = detectedType;
      }
    }

    // ========================
    // GUARD
    // ========================
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: 'Tidak ada perubahan' },
        { status: 400 }
      );
    }

    // ========================
    // UPDATE
    // ========================
    const updated = await updateOrganizationAsset(id, data);

    if (!updated) {
      return NextResponse.json(
        { message: 'Organization Asset tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Organization Asset berhasil diupdate',
      data: updated,
    });
  } catch (e: any) {
    console.error('PATCH ORGANIZATION ASSET ERROR:', e);

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
    await deleteOrganizationAsset(id);
    return NextResponse.json({
      success: true,
      message: 'Organization Asset berhasil dihapus',
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
