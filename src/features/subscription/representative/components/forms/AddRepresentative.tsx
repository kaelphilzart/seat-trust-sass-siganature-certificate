'use client';

import React, { useState, useEffect } from 'react';
import { ICreateRepresentative } from '@/types/representative';
import { Input } from '@/components/ui/input';

interface AddRepresentativeFormProps {
  formData?: Partial<ICreateRepresentative>;
  onChange?: (data: ICreateRepresentative) => void;
}

export default function AddRepresentativeForm({
  formData,
  onChange,
}: AddRepresentativeFormProps) {
  const [form, setForm] = useState<Partial<ICreateRepresentative>>(
    formData ?? {}
  );

  useEffect(() => {
    if (form.name && form.title) {
      onChange?.(form as ICreateRepresentative);
    }
  }, [form, onChange]);

  const handleChange = <K extends keyof ICreateRepresentative>(
    field: K,
    value: ICreateRepresentative[K]
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
