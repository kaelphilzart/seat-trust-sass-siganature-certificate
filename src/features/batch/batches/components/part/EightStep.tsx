'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconUser, IconTrash, IconPlus } from '@tabler/icons-react';
import { ICreateParticipant } from '@/types/participant';

type ParticipantInput = Omit<ICreateParticipant, 'batch_id'>;

type Step6Payload = {
  participants: ParticipantInput[];
};

type Props = {
  onBack: () => void;
  onFinish: (data: Step6Payload) => void;
};

export default function SixStep({ onBack, onFinish }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [participants, setParticipants] = useState<ParticipantInput[]>([]);

  const handleAdd = () => {
    if (!name || !email) return;

    setParticipants((prev) => [...prev, { name, email }]);

    // reset form
    setName('');
    setEmail('');
  };

  const handleRemove = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack}>
          Kembali
        </Button>
        <div className="text-sm text-black/45">Step 8 — Tambah Participant</div>
      </div>

      {/* FORM */}
      <div className="bg-gray-50 p-6 rounded shadow space-y-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <IconUser className="w-12 h-12 text-blue-500" />
          <div className="text-lg font-medium">Tambah participant baru</div>
        </div>

        {/* INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            type="text"
            placeholder="Nama participant"
            className="w-full border border-gray-300 rounded p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            type="email"
            placeholder="Email participant"
            className="w-full border border-gray-300 rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-2">
          <Button onClick={handleAdd}>
            <IconPlus className="w-4 h-4" />
            Tambah
          </Button>
          <Button
            variant="secondary"
            onClick={() => onFinish({ participants })}
          >
            Selesai
          </Button>
        </div>
      </div>

      {/* LIST PARTICIPANTS */}
      {participants.length > 0 && (
        <div className="bg-white border rounded p-4 space-y-3">
          <div className="text-sm font-medium text-gray-700">
            List Participant ({participants.length})
          </div>

          <div className="space-y-2">
            {participants.map((p, index) => (
              <div
                key={`${p.email}-${index}`}
                className="flex items-center justify-between border rounded p-3"
              >
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.email}</div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                >
                  <IconTrash className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
