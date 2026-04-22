import { NextResponse } from 'next/server';
import {
  getAllTemplatePositionBindings,
  upsertTemplatePositionBindingsBulk,
} from '@/server/services/templatePositionBinding';

export async function GET() {
  try {
    return NextResponse.json({ data: await getAllTemplatePositionBindings() });
  } catch (e: any) {
    console.error('GET template position binding ERROR:', e);
    return NextResponse.json(
      { message: e?.message || 'Server error' },
      { status: 500 }
    );
  }
}

// ============================
// (UPsert: POST + PATCH)
// ============================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const payloads = Array.isArray(body) ? body : [body];

    if (!payloads.length) {
      return NextResponse.json({ message: 'Payload kosong' }, { status: 400 });
    }

    // =========================
    // VALIDATION
    // =========================
    for (const item of payloads) {
      if (!item.template_position_id || !item.batch_representative_id) {
        return NextResponse.json(
          {
            message: 'template_position_id & batch_representative_id wajib',
          },
          { status: 400 }
        );
      }
    }

    // =========================
    // FULL SYNC
    // =========================
    await upsertTemplatePositionBindingsBulk(payloads);

    return NextResponse.json(
      {
        message: 'Template position bindings synced successfully',
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error('SYNC TEMPLATE POSITION BINDING ERROR:', e);

    return NextResponse.json(
      {
        message: e?.message || 'Server error',
      },
      { status: 500 }
    );
  }
}

//delete
// export async function DELETE(req: Request) {
//     try {
//         const body = await req.json();

//         const ids: string[] = body?.ids || [];

//         if (!ids.length) {
//             return NextResponse.json(
//                 { message: 'IDs wajib diisi' },
//                 { status: 400 }
//             );
//         }

//         await deleteTemplatePositionBindingsBulk(ids);

//         return NextResponse.json(
//             {
//                 message: 'Template position bindings deleted successfully',
//             },
//             { status: 200 }
//         );

//     } catch (e: any) {
//         console.error('DELETE TEMPLATE POSITION BINDING ERROR:', e);

//         return NextResponse.json(
//             {
//                 message: e?.message || 'Server error',
//             },
//             { status: 500 }
//         );
//     }
// }
