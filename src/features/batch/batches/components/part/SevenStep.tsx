
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { IconUserPlus, IconX } from '@tabler/icons-react';



export default function SevenStep({ onFinish, onBack, batchId }: any) {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-black/45">Step 7 — Tambah Participant?</div>
      </div>

      {/* PANEL PILIHAN */}
      <div className="bg-gray-50 p-6 rounded shadow space-y-4 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <IconUserPlus className="w-12 h-12 text-green-500" />
          <div className="text-lg font-medium">Apakah ingin menambahkan participant?</div>
          <div className="text-sm text-gray-500">
            Kamu bisa melewati langkah ini dan menambahkan participant nanti.
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <Button
            variant="default"
            onClick={() => onFinish(true)} 
          >
            Iya, tambah participant
          </Button>
          <Button
            variant="outline"
            onClick={() => onFinish(false)} // skip, langsung selesai
          >
            Lewati
          </Button>
        </div>
      </div>
    </div>
  );
}