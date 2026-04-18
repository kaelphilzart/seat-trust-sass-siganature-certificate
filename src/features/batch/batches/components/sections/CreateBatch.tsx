'use client';

import React, { useState, useEffect } from 'react';
import OneStep from '../part/OneStep';
import TwoStep from '../part/TwoStep';
import TreeStep from '../part/TreeStep';
import FourStep from '../part/FourStep';
import FiveStep from '../part/FiveStep';
import SixStep from '../part/SixStep';
import SevenStep from '../part/SevenStep';
import EightStep from '../part/EightStep';

import { ICreateBatch } from '@/types/batch';
import { createBatch } from '@/hooks/batch';

import { ICreateTemplatePosition, } from '@/types/template-position';
import { syncTemplatePositionsBulk } from '@/hooks/template-position';
import { syncBatchRepresentatives } from '@/hooks/batch-representative';
import { syncTemplatePositionBindings } from '@/hooks/template-position-bindings';
import { ICreateParticipant } from '@/types/participant';
import { createBulkParticipants } from '@/hooks/participant';

import { useAlert } from '@/components/alert/alert-dialog-global';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { paths } from '@/routes/paths';

export default function CreateBatch({
  batchId: initialBatchId,
}: {
  batchId?: string | null;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(1);
  const alert = useAlert();
  const router = useRouter();
  const { data: session } = useSession();
  const organizationId = session?.user?.organization_id || null;

  const [loading, setLoading] = useState(false);

  // Step 1 data
  const [event, setEvent] = useState({
    name: '',
    start_date: '',
    end_date: '',
  });

  const [templateId, setTemplateId] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(
    initialBatchId ?? null
  );


  // Step 2 data
  useEffect(() => {
    if (initialBatchId) {
      setStep(3); // atau step sesuai flow lu
    }
  }, [initialBatchId]);

  const [templatePosition, setTemplatePosition] = useState<ICreateTemplatePosition>({
    batch_id: '',
    element_type_id: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    asset_id: '',
    font_size: 0,
    font_weight: '',
  });

  // Step 4 data

  const isDirty =
    !!event.name || !!event.start_date || !!event.end_date || !!templateId;

  /* ================= GLOBAL BLOCK EXIT ================= */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () =>
      window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  /* ================= HANDLE SUBMIT BATCH ================= */
  const handleSubmit = async () => {
    if (loading) return;

    if (!event.name) return alert.error('Nama event wajib diisi!');
    if (!templateId) return alert.error('Template wajib dipilih atau file di-upload!');

    await alert.confirmAsync(
      'Yakin ingin membuat batch ini?',
      async () => {
        setLoading(true);
        try {
          const payload: ICreateBatch = {
            name: event.name,
            start_date: event.start_date ? new Date(event.start_date) : undefined,
            end_date: event.end_date ? new Date(event.end_date) : undefined,
            template_id: templateId || undefined,
            organization_id: organizationId || undefined,
            status: 'DRAFT',
          };

          const res = await createBatch(payload);

          // misalnya API balikin id
          const createdBatchId = res.data?.id;
          alert.success('Batch berhasil dibuat!');

          // Reset Step 1 & 2
          setEvent({ name: '', start_date: '', end_date: '' });
          setTemplateId(null);

          // Lanjut ke Step 3: Pilihan tambahan
          setBatchId(createdBatchId ?? '');
          setStep(3);
          return { success: true };
        } catch (err: any) {
          return {
            success: false,
            message: err?.message || 'Gagal membuat batch',
          };
        } finally {
          setLoading(false);
        }
      }
    );
  };

  /* ================= HANDLE STEP 3 CHOICE ================= */
  const handleStep3Choice = (setupTemplate: boolean) => {
    if (setupTemplate) {
      setStep(4); // lanjut ke step 4: assign signature / setup template
    } else {
      setStep(6); // lewati langsung ke participants
    }
  };

  /* ================= HANDLE STEP 4 FINISH ================= */
  const handleStep4Finish = async (
    dataFromCanvas: (ICreateTemplatePosition & { id?: string })[] | null
  ) => {
    if (loading) return;
    if (!batchId) return alert.error('Batch belum tersedia!');

    // 🔥 SKIP EMPTY CANVAS
    if (!dataFromCanvas?.length) {
      setStep(5);
      return;
    }

    await alert.confirmAsync(
      'Yakin ingin menyimpan setup template ini?',
      async () => {
        setLoading(true);

        try {
          // =========================
          // SIMPLIFIED: NO DIFF LOGIC
          // =========================
          const payload = dataFromCanvas.map((item) => ({
            batch_id: batchId,
            element_type_id: item.element_type_id,
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
            rotation: item.rotation ?? 0,
            asset_id: item.asset_id ?? undefined,
            font_size: item.font_size ?? undefined,
            font_weight: item.font_weight ?? undefined,
            id: item.id, // optional (for update/delete tracking)
          }));

          // =========================
          // SINGLE SYNC CALL
          // =========================
          await syncTemplatePositionsBulk(payload);

          alert.success('Template position berhasil disimpan!');
          setStep(5);

          return { success: true };
        } catch (err: any) {
          return {
            success: false,
            message: err?.message || 'Gagal menyimpan template position',
          };
        } finally {
          setLoading(false);
        }
      }
    );
  };

  /* ================= HANDLE STEP 5 PARTICIPANT ================= */
  const handleStep5Finish = async ({
    ids,
    isDirty,
  }: {
    ids: string[];
    isDirty: boolean;
  }) => {
    if (loading) return;
    if (!batchId) return alert.error('Batch belum tersedia!');

    // =========================
    // 🔥 NO CHANGE → SKIP API
    // =========================
    if (!isDirty) {
      setStep(6);
      return;
    }

    // =========================
    // 🔥 OPTIONAL: EMPTY → SKIP / CLEAR
    // =========================
    if (!ids?.length) {
      setStep(6);
      return;
    }

    await alert.confirmAsync(
      'Yakin ingin menyimpan representative ini?',
      async () => {
        setLoading(true);

        try {
          const payload = ids.map((repId) => ({
            batch_id: batchId,
            representative_id: repId,
          }));

          await syncBatchRepresentatives(payload);

          alert.success('Representative berhasil disimpan!');
          setStep(6);

          return { success: true };
        } catch (err: any) {
          return {
            success: false,
            message: err?.message || 'Gagal menyimpan representative',
          };
        } finally {
          setLoading(false);
        }
      }
    );
  };

  /* ================= HANDLE STEP 6 FINISH ================= */
  const handleStep6Finish = async ({
    data,
    isDirty,
  }: {
    data: any[];
    isDirty: boolean;
  }) => {
    if (loading) return;

    // =========================
    // NO CHANGE → SKIP API
    // =========================
    if (!isDirty) {
      setStep(7);
      return;
    }

    // =========================
    // EMPTY → SKIP
    // =========================
    if (!data?.length) {
      setStep(7);
      return;
    }

    await alert.confirmAsync(
      'Yakin ingin menyimpan assignment ini?',
      async () => {
        setLoading(true);

        try {
          await syncTemplatePositionBindings(data);

          alert.success('Assignment berhasil disimpan!');
          setStep(7);

          return { success: true };
        } catch (err: any) {
          return {
            success: false,
            message: err?.message || 'Gagal menyimpan assignment',
          };
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleStep7Finish = (isAddParticipant: boolean) => {
    if (isAddParticipant) {
      // lanjut ke step berikutnya (misal step 8 / form participant)
      setStep(8);
    } else {
      // langsung selesai → redirect ke base
      router.push(paths.batch.base);
    }
  };

  const handleStep8Finish = async (
    participants: Omit<ICreateParticipant, 'batch_id'>[]
  ) => {
    if (loading) return;
    if (!batchId) return alert.error('Batch belum tersedia!');

    // 🔥 SKIP kalau kosong
    if (!participants?.length) {
      router.push(paths.batch.base);
      return;
    }

    await alert.confirmAsync(
      'Yakin ingin menyimpan participant ini?',
      async () => {
        setLoading(true);

        try {
          // =========================
          // BUILD PAYLOAD
          // =========================
          const payload = participants.map((item) => ({
            batch_id: batchId,
            name: item.name,
            email: item.email,
          }));

          // =========================
          // CALL API BULK CREATE
          // =========================
          await createBulkParticipants(payload);

          alert.success('Participants berhasil ditambahkan!');

          // redirect ke base
          router.push(paths.batch.base);

          return { success: true };
        } catch (err: any) {
          return {
            success: false,
            message: err?.message || 'Gagal menambahkan participants',
          };
        } finally {
          setLoading(false);
        }
      }
    );
  };

  return (
    <>
      {step === 1 && (
        <OneStep
          data={event}
          onChange={setEvent}
          onNext={() => setStep(2)}
          isDirty={isDirty}
        />
      )}

      {step === 2 && (
        <TwoStep
          event={event}
          templateId={templateId}
          organizationId={organizationId}
          onSelectTemplate={setTemplateId}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
        />
      )}

      {step === 3 && (
        <TreeStep
          batchId={batchId}
          onNext={handleStep3Choice}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <FourStep
          batchId={batchId}
          data={templatePosition}
          onChange={setTemplatePosition}
          onBack={() => setStep(3)}
          onFinish={handleStep4Finish}
        />
      )}

      {step === 5 && (
        <FiveStep
          onBack={() => setStep(4)}
          onFinish={handleStep5Finish}
          batchId={batchId}
        />
      )}

      {step === 6 && (
        <SixStep
          onBack={() => setStep(5)}
          onFinish={handleStep6Finish}
          batchId={batchId}
        />
      )}

      {step === 7 && (
        <SevenStep
          onBack={() => setStep(6)}
          onFinish={handleStep7Finish}
          batchId={batchId}
        />
      )}

      {step === 8 && (
        <EightStep
          onBack={() => setStep(7)}
          onFinish={handleStep8Finish}
          batchId={batchId}
        />
      )}

      {loading && <div className="text-center mt-4">Submitting...</div>}
    </>
  );
}