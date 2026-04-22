import { NextResponse } from 'next/server';
import { getAllTemplates, createTemplate } from '@/server/services/template';
import { getServerSession } from 'next-auth';
import { uploadToCloudinaryTemplate } from '@/server/services/upload';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    return NextResponse.json({ data: await getAllTemplates() });
  } catch (e: any) {
    console.error('GET TEMPLATE ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}

/* ================= POST ================= */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const organization_id = session?.user?.organization_id;

    if (!organization_id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file || !name) {
      return NextResponse.json(
        { message: 'file and name are required' },
        { status: 400 }
      );
    }

    /* upload */
    const bytes = await file.arrayBuffer();
    const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`;
    const upload = await uploadToCloudinaryTemplate(base64);

    /* save */
    const template = await createTemplate({
      name,
      file_path: upload.url,
      organization_id,
    });

    return NextResponse.json(
      {
        message: 'Template berhasil dibuat',
        data: template,
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('POST TEMPLATE ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
