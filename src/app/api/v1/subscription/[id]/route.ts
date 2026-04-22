import { NextResponse } from 'next/server';
import {
  getAllSubscriptions,
  updateSubscription,
  deleteSubscription,
} from '@/server/services/subscription';

// ============================
// (GET)
// ============================
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const planId = (await params).id;
    const data = await getAllSubscriptions(planId);

    return NextResponse.json({ data });
  } catch (e: any) {
    console.error('GET Subscriptions ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
// ============================
// (POST)
// ============================
// export async function POST(
//   req: Request,
//   { params }: { params: Promise<{ id: string }>  }
// ) {
//   try {
//     const { id } = await params;

//     const { plan_id, start_date, end_date, status } = await req.json();

//     if (!plan_id || !start_date || !end_date) {
//       return NextResponse.json(
//         { message: 'plan_id, start_date, dan end_date wajib diisi' },
//         { status: 400 }
//       );
//     }

//     const data = await createSubscriptionByParam(id, {
//       plan_id,
//       start_date,
//       end_date,
//       status: status || 'true',
//       organization_id: id,
//     });

//     return NextResponse.json(
//       {
//         message: 'Subscription berhasil dibuat',
//         data,
//       },
//       { status: 201 }
//     );
//   } catch (e: any) {
//     console.error('POST SUBSCRIPTION ERROR:', e);

//     return NextResponse.json(
//       { message: e?.message || 'Server error' },
//       { status: 500 }
//     );
//   }
// }

// ============================
// (PATCH)
// ============================
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateSubscription(id, body);

    if (!updated)
      return NextResponse.json(
        { message: 'Subscription tidak ditemukan' },
        { status: 404 }
      );

    return NextResponse.json(updated);
  } catch (e: any) {
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
    await deleteSubscription(id);
    return NextResponse.json({
      success: true,
      message: 'Subscription berhasil dihapus',
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}
