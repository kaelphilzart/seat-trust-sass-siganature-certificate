import { NextResponse } from 'next/server';
import {
  getAllOrganizations,
  createOrganization,
} from '@/server/services/organizationService';

export async function GET() {
  try {
    return NextResponse.json({ data: await getAllOrganizations() });
  } catch (e: any) {
    console.error('GET ORGANIZATION ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, slug, logo } = await req.json();
    if (!name || !slug) {
      return NextResponse.json(
        { message: 'name and slug are required' },
        { status: 400 }
      );
    }
    const organization = await createOrganization({
      name,
      slug,
      logo: logo ?? null,
    });
    return NextResponse.json(
      {
        message: 'Organization berhasil dibuat',
        data: organization,
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('POST ORGANIZATION ERROR:', e);

    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
