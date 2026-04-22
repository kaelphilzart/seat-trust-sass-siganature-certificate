'use client';

import React, { useState, useEffect } from 'react';
import { IUpdatePlanFeatureValue } from '@/types/plan-feature-value';
import { Input } from '@/components/ui/input';
import { formatIDR, parseIDR } from '@/utils/format';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface EditPlanFeatureValueFormProps {
  formData?: IUpdatePlanFeatureValue;
  onChange?: (data: IUpdatePlanFeatureValue) => void;
}

export default function EditPlanFeatureValueForm({
  formData,
  onChange,
}: EditPlanFeatureValueFormProps) {
  const [form, setForm] = useState<IUpdatePlanFeatureValue>(formData ?? {});

  useEffect(() => {
    if (!formData?.id) return;
    onChange?.({ ...form, id: formData.id });
  }, [form, onChange, formData?.id]);

  const handleChange = <K extends keyof IUpdatePlanFeatureValue>(
    field: K,
    value: IUpdatePlanFeatureValue[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const featureType = form.feature?.feature_type;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <Label className="mb-1 block text-sm font-medium">
          {form.feature?.display_name}
        </Label>

        {/* BOOLEAN → CHECKBOX */}
        {featureType === 'boolean' && (
          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="edit-feature-value"
              checked={form.value === 'true'}
              onCheckedChange={(checked) =>
                handleChange('value', checked ? 'true' : 'false')
              }
            />
            <Label htmlFor="edit-feature-value">Aktifkan</Label>
          </div>
        )}

        {/* NUMBER */}
        {featureType === 'number' && (
          <Input
            type="number"
            value={form.value ?? ''}
            onChange={(e) => handleChange('value', e.target.value)}
          />
        )}

        {/* CURRENCY */}
        {featureType === 'currency' && (
          <Input
            type="text"
            value={formatIDR(Number(form.value ?? 0))}
            onChange={(e) =>
              handleChange('value', parseIDR(e.target.value).toString())
            }
          />
        )}

        {/* DEFAULT STRING */}
        {(!featureType || featureType === 'string') && (
          <Input
            type="text"
            value={form.value ?? ''}
            onChange={(e) => handleChange('value', e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
