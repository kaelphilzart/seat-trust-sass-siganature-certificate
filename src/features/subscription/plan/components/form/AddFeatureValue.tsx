'use client';

import React, { useState, useEffect } from 'react';
import { ICreatePlanFeatureValue } from '@/types/plan-feature-value';
import { Input } from '@/components/ui/input';
import { ComboboxField } from '@/components/ui/combobox-field';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useGetAllFeatures } from '@/hooks/features';
import { formatIDR, parseIDR } from '@/utils/format';

interface AddFeatureValueFormProps {
  formData?: Partial<ICreatePlanFeatureValue>;
  onChange?: (data: Partial<ICreatePlanFeatureValue>) => void;
}

const STORAGE_KEY = 'add_feature_value_form';

export default function AddFeatureValueForm({
  formData,
  onChange,
}: AddFeatureValueFormProps) {
  const [form, setForm] = useState<Partial<ICreatePlanFeatureValue>>(
    formData ?? {}
  );
  const { features, featuresLoading } = useGetAllFeatures();

  /* ===== SAVE DRAFT ===== */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    onChange?.(form);
  }, [form, onChange]);

  const handleChange = <K extends keyof ICreatePlanFeatureValue>(
    field: K,
    value: ICreatePlanFeatureValue[K] | undefined
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectedFeature = features.find((f) => f.id === form.feature_id);
  const featureType = selectedFeature?.feature_type;

  return (
    <div className="">
      {/* SELECT FEATURE */}
      <div>
        <ComboboxField
          value={form.feature_id}
          items={features}
          getValue={(item) => item.id ?? ''}
          getLabel={(item) => item.display_name ?? ''}
          placeholder={featuresLoading ? 'Loading fitur...' : 'Pilih fitur'}
          disabled={featuresLoading || features.length === 0}
          onChange={(value) => {
            handleChange('feature_id', value);
            handleChange('value', '');
          }}
        />
      </div>

      {/* VALUE INPUT */}
      {selectedFeature && (
        <div className="mt-4 p-2">
          <Label className="mb-1 block text-sm font-medium">
            {selectedFeature.display_name}
          </Label>

          {/* BOOLEAN */}
          {featureType === 'boolean' && (
            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                id="feature-value"
                checked={form.value === 'true'}
                onCheckedChange={(checked) =>
                  handleChange('value', checked ? 'true' : 'false')
                }
              />
              <Label htmlFor="feature-value">Aktifkan</Label>
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

          {/* STRING DEFAULT */}
          {(!featureType || featureType === 'string') && (
            <Input
              type="text"
              value={form.value ?? ''}
              onChange={(e) => handleChange('value', e.target.value)}
            />
          )}
        </div>
      )}
    </div>
  );
}
