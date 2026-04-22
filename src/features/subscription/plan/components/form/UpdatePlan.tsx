'use client';

import React, { useState, useEffect } from 'react';
import { IUpdatePlan } from '@/types/plan';
import { Input } from '@/components/ui/input';
import { formatIDR, parseIDR } from '@/utils/format';
import { Label } from '@/components/ui/label';

interface EditPlanFormProps {
  formData?: IUpdatePlan;
  onChange?: (data: IUpdatePlan) => void;
}

export default function EditPlanForm({
  formData,
  onChange,
}: EditPlanFormProps) {
  const [form, setForm] = useState<IUpdatePlan>(formData ?? {});

  useEffect(() => {
    if (!formData?.id) return;
    onChange?.({ ...form, id: formData.id });
  }, [form, onChange, formData?.id]);

  const handleChange = <K extends keyof IUpdatePlan>(
    field: K,
    value: IUpdatePlan[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <Label className="mb-1 block text-sm font-medium">Name</Label>
        <Input
          type="text"
          value={form.name ?? ''}
          onChange={(e) => handleChange('name', e.target.value)}
        />
      </div>

      <div>
        <Label className="mb-1 block text-sm font-medium">Harga</Label>
        <Input
          inputMode="numeric"
          value={formatIDR(form.price)}
          onChange={(e) => handleChange('price', parseIDR(e.target.value))}
          placeholder="Rp 0"
        />
      </div>
    </div>
  );
}
