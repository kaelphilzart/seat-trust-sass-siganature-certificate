import { NextResponse } from 'next/server';
import {
  createOrganizationAsset,
  getAllOrganizationsAssets,
} from '@/server/services/organizationAssetServices';
import { getServerSession } from 'next-auth';
import { uploadToCloudinaryOrganizationAsset } from '@/server/services/upload';
import { authOptions } from '@/lib/auth';
import { AssetType } from '@/types/organization';

export async function GET() {
  try {
    return NextResponse.json({ data: await getAllOrganizationsAssets() });
  } catch (e: any) {
    console.error('GET organization assets ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    /* ================= SESSION ================= */
    const session = await getServerSession(authOptions);
    const organization_id = session?.user?.organization_id;

    if (!organization_id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    /* ================= FORM DATA ================= */
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file || !name) {
      return NextResponse.json(
        { message: 'file and name are required' },
        { status: 400 }
      );
    }

    /* ================= DETECT TYPE ================= */
    let type: AssetType = 'IMAGE';

    if (file.type.startsWith('image/')) {
      type = 'IMAGE';
    } else if (
      file.type.includes('font') ||
      file.name.endsWith('.ttf') ||
      file.name.endsWith('.woff') ||
      file.name.endsWith('.woff2')
    ) {
      type = 'FONT';
    }

    // 🔥 OPTIONAL: kalau mau manual dari frontend
    const typeFromClient = formData.get('type') as AssetType | null;
    if (typeFromClient && ['IMAGE', 'FONT', 'LOGO'].includes(typeFromClient)) {
      type = typeFromClient;
    }

    /* ================= UPLOAD ================= */
    const bytes = await file.arrayBuffer();

    const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString(
      'base64'
    )}`;

    const upload = await uploadToCloudinaryOrganizationAsset(base64);

    if (!upload?.url) {
      throw new Error('Upload failed');
    }

    /* ================= SAVE ================= */
    const organizationAsset = await createOrganizationAsset({
      name,
      type,
      file_path: upload.url,
      organization_id,
    });

    /* ================= RESPONSE ================= */
    return NextResponse.json(
      {
        message: 'Organization Asset berhasil dibuat',
        data: organizationAsset,
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('POST ORGANIZATION ASSET ERROR:', e);

    return NextResponse.json(
      {
        message: e?.message || 'Server error',
      },
      { status: 500 }
    );
  }
}
