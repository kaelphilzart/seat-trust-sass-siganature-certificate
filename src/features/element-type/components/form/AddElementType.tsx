'use client';

import React, { useState, useEffect } from 'react';
import { ICreateElementType } from '@/types/element-type';
import { useGetAllFeatures } from '@/hooks/features';
import { Input } from '@/components/ui/input';
import { ComboboxField } from '@/components/ui/combobox-field';
import Image from 'next/image';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface AddElementTypeFormProps {
  formData?: ICreateElementType;
  onChange?: (data: ICreateElementType) => void;
}

const STORAGE_KEY = 'add_element_type_form';

export default function AddElementTypeForm({
  formData,
  onChange,
}: AddElementTypeFormProps) {
  const [form, setForm] = useState<ICreateElementType>(formData ?? {});
  const [preview, setPreview] = useState<string | null>(null);

  const { features, featuresLoading } = useGetAllFeatures();

  /* ===== SAVE DRAFT & NOTIFY PARENT ===== */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    onChange?.(form);
  }, [form, onChange]);

  /* ===== CLEANUP PREVIEW ===== */
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = <K extends keyof ICreateElementType>(
    field: K,
    value: ICreateElementType[K]
  ) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const selectedFeature = features.find(
    (f) => f.feature_key === form.feature_key
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

      {/* Name */}
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <Input
          type="text"
          value={form.name ?? ''}
          onChange={e => handleChange('name', e.target.value)}
          placeholder="Nama Element Type"
        />
      </div>

      {/* Code */}
      <div>
        <label className="mb-1 block text-sm font-medium">Code</label>
        <Input
          type="text"
          value={form.code ?? ''}
          onChange={e => handleChange('code', e.target.value)}
          placeholder="Kode unik (optional)"
        />
      </div>

      {/* Default Width */}
      <div>
        <label className="mb-1 block text-sm font-medium">Default Width</label>
        <Input
          type="number"
          value={form.default_width ?? ''}
          onChange={e => {
            const val = e.target.value;
            handleChange(
              'default_width',
              val === '' ? undefined : Number(val)
            );
          }}
        />
      </div>

      {/* Default Height */}
      <div>
        <label className="mb-1 block text-sm font-medium">Default Height</label>
        <Input
          type="number"
          value={form.default_height ?? ''}
          onChange={e => {
            const val = e.target.value;
            handleChange(
              'default_height',
              val === '' ? undefined : Number(val)
            );
          }}
        />
      </div>

      {/* Default Rotation */}
      <div>
        <label className="mb-1 block text-sm font-medium">Default Rotation</label>
        <Input
          type="number"
          value={form.default_rotation ?? ''}
          onChange={e => {
            const val = e.target.value;
            handleChange(
              'default_rotation',
              val === '' ? undefined : Number(val)
            );
          }}
        />
      </div>

      {/* Combobox Feature */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Default Feature
        </label>

        <ComboboxField
          value={form.feature_key ?? ''}
          items={features}
          getValue={(item) => item.feature_key ?? ''}
          getLabel={(item) => item.feature_key ?? ''}
          placeholder={featuresLoading ? 'Loading fitur...' : 'Pilih fitur'}
          disabled={featuresLoading || features.length === 0}
          onChange={(value) => {
            handleChange('feature_key', value);
          }}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">UI Type</label>
        <Select
          value={form.ui_type}
          onValueChange={(val) => handleChange('ui_type', val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih UI Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="element">element</SelectItem>
            <SelectItem value="asset">asset</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ELEMENT KIND */}
      <div>
        <label className="mb-1 block text-sm font-medium">Element Kind</label>
        <Select
          value={form.element_kind}
          onValueChange={(val) => handleChange('element_kind', val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih Element Kind" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">text</SelectItem>
            <SelectItem value="image">image</SelectItem>
            <SelectItem value="qr">qr</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ASSET TYPE */}
      <div>
        <label className="mb-1 block text-sm font-medium">Asset Type</label>
        <Select
          value={form.asset_type}
          onValueChange={(val) => handleChange('asset_type', val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih Asset Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="font">font</SelectItem>
            <SelectItem value="image">image</SelectItem>
            <SelectItem value="logo">logo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* File Upload */}
      <div className="md:col-span-1">
        <label className="mb-1 block text-sm font-medium">
          Icon / File
        </label>

        <Input
          type="file"
          accept="image/*"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              handleChange('file_path', file);

              const url = URL.createObjectURL(file);
              setPreview(url);
            }
          }}
        />

        {form.file_path && (
          <p className="text-sm mt-1">
            {(form.file_path as File).name}
          </p>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="md:col-span-2 mt-2">
          <Image
            src={preview}
            alt="preview"
            width={80}
            height={80}
            className="object-cover rounded border"
          />
        </div>
      )}
    </div>
  );
}