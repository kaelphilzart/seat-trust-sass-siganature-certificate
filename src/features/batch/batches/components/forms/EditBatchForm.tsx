'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { IUpdateBatch } from '@/types/batch';

interface EditBatchFormProps {
  formData?: IUpdateBatch;
  onChange?: (data: IUpdateBatch) => void;
}

export default function EditbatchForm({
  formData,
  onChange,
}: EditBatchFormProps) {
  const [form, setForm] = useState<Partial<IUpdateBatch>>(formData ?? {});

  /* ===== SYNC KE PARENT ===== */

  useEffect(() => {
    onChange?.(form);
  }, [form, onChange]);

  const handleChange = <K extends keyof IUpdateBatch>(
    field: K,
    value: IUpdateBatch[K] | undefined
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
      {/* NAME */}
      <div>
        <label className="mb-1 block text-sm font-medium">Name Event</label>
        <Input
          type="text"
          value={form.name ?? ''}
          onChange={(e) => handleChange('name', e.target.value)}
        />
      </div>

      {/* DATE RANGE WRAPPER */}
      <div className="grid grid-cols-2 gap-4">
        {/* START DATE */}
        <div>
          <label className="mb-1 block text-sm font-medium">Start Date</label>
          <Input
            type="date"
            value={
              form.start_date
                ? new Date(form.start_date).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) => handleChange('start_date', e.target.value)}
          />
        </div>

        {/* END DATE */}
        <div>
          <label className="mb-1 block text-sm font-medium">End Date</label>
          <Input
            type="date"
            value={
              form.end_date
                ? new Date(form.end_date).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) => handleChange('end_date', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
