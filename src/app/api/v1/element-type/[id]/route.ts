import { NextResponse } from 'next/server';
import { getElementTypeById, updateElementType, deleteElementType } from '@/server/services/elementTypeServices';
import { uploadToCloudinaryElement } from '@/server/services/upload';

// ============================
// GET BY ID
// ============================
export async function GET(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const feature = await getElementTypeById(id);

        if (!feature)
            return NextResponse.json({ message: 'Element tidak ditemukan' }, { status: 404 });

        return NextResponse.json(feature);
    } catch (e: any) {
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

    /* ================= GET DATA ================= */
    const file = formData.get('file') as File | null;
    const name = formData.get('name') as string | null;
    const code = formData.get('code') as string | null;

    const default_width_raw = formData.get('default_width');
    const default_height_raw = formData.get('default_height');
    const default_rotation_raw = formData.get('default_rotation');

    // 🔥 NEW FIELD
    const ui_type = formData.get('ui_type') as string | null;
    const element_kind = formData.get('element_kind') as string | null;
    const asset_type = formData.get('asset_type') as string | null;
    const feature_key = formData.get('feature_key') as string | null;

    const data: any = {};

    /* ================= STRING ================= */
    if (name !== null && name !== '') data.name = name;
    if (code !== null && code !== '') data.code = code;

    /* ================= NUMBER ================= */
    if (default_width_raw !== null && default_width_raw !== '') {
      data.default_width = Number(default_width_raw);
    }

    if (default_height_raw !== null && default_height_raw !== '') {
      data.default_height = Number(default_height_raw);
    }

    if (default_rotation_raw !== null && default_rotation_raw !== '') {
      data.default_rotation = Number(default_rotation_raw);
    }

    /* ================= NEW FIELD ================= */
    if (ui_type !== null) data.ui_type = ui_type || null;
    if (element_kind !== null) data.element_kind = element_kind || null;
    if (asset_type !== null) data.asset_type = asset_type || null;
    if (feature_key !== null) data.feature_key = feature_key || null;

    /* ================= FILE ================= */
    if (file) {
      const bytes = await file.arrayBuffer();
      const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`;
      const upload = await uploadToCloudinaryElement(base64);
      data.icon_path = upload.url;
    }

    /* ================= DEBUG ================= */
    console.log('UPDATE DATA:', data);

    /* ================= GUARD ================= */
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: 'Tidak ada perubahan' },
        { status: 400 }
      );
    }

    const updated = await updateElementType(id, data);

    if (!updated) {
      return NextResponse.json(
        { message: 'Element Type tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Element Type berhasil diupdate',
      data: updated,
    });

  } catch (e: any) {
    console.error('PATCH ELEMENT TYPE ERROR:', e);

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
    await deleteElementType(id);
    return NextResponse.json({ success: true, message: 'Element Type berhasil dihapus' });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}