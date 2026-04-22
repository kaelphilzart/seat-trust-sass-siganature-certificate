'use client';

import React, { useState, useEffect } from 'react';
import { IUpdateRepresentative } from '@/types/representative';
import { Input } from '@/components/ui/input';

interface EditRepresentativeFormProps {
  representativeData?: IUpdateRepresentative;
  onChange?: (data: IUpdateRepresentative) => void;
}

export default function EditRepresentativeForm({
  representativeData,
  onChange,
}: EditRepresentativeFormProps) {
  const [form, setForm] = useState<IUpdateRepresentative>(
    representativeData ?? {}
  );
  useEffect(() => {
    if (!representativeData?.id) return;
    onChange?.({ ...form, id: representativeData.id });
  }, [form, onChange, representativeData?.id]);

  const handleChange = <K extends keyof IUpdateRepresentative>(
    field: K,
    value: IUpdateRepresentative[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Name */}
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <Input
          type="text"
          value={form.name ?? ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Name"
        />
      </div>

      {/* Title */}
      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <Input
          type="text"
          value={form.title ?? ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Title"
        />
      </div>
    </div>
  );
}
