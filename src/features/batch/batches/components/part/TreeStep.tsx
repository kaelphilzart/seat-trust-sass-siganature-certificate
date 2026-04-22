'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { IconFileText } from '@tabler/icons-react';

type SetupTemplateStepProps = {
  batchId: string | null;
  onNext: (setupTemplate: boolean) => void;
  onBack: () => void;
};

export default function TreeStep({
  batchId,
  onNext,
  onBack,
}: SetupTemplateStepProps) {
  // 🔥 HARD GUARD: kalau batchId tidak ada
  if (!batchId) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center space-y-4">
        <div className="text-red-500 font-medium">Batch tidak ditemukan</div>
        <div className="text-sm text-gray-500">
          Silakan kembali ke step sebelumnya dan buat batch terlebih dahulu
        </div>

        <Button onClick={onBack} variant="outline">
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack}>
          Kembali
        </Button>
        <div className="text-sm text-black/45">Step 3 — Setup Template?</div>
      </div>

      {/* PANEL */}
      <div className="bg-gray-50 p-6 rounded shadow space-y-4 text-center">
        <IconFileText className="w-12 h-12 text-blue-500 mx-auto" />

        <div className="text-lg font-medium">
          Apakah ingin mengatur template sekarang?
        </div>

        <div className="text-sm text-gray-500">
          Batch ID sudah tersedia, kamu bisa lanjut ke setup template atau skip
          ke participant.
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <Button onClick={() => onNext(true)}>Iya, setup template</Button>

          <Button variant="outline" onClick={() => onNext(false)}>
            Lewati
          </Button>
        </div>
      </div>
    </div>
  );
}
