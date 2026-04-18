'use client';

import React, { useState, useEffect } from 'react';
import { IUpdateElementType } from '@/types/element-type';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { ComboboxField } from '@/components/ui/combobox-field';
import { useGetAllFeatures } from '@/hooks/features';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditElementTypeFormProps {
  formData?: IUpdateElementType;
  onChange?: (data: IUpdateElementType) => void;
}

export default function EditElementTypeForm({
  formData,
  onChange,
}: EditElementTypeFormProps) {
  const [form, setForm] = useState<IUpdateElementType>({});
  const [preview, setPreview] = useState<string | null>(null);

  const { features, featuresLoading } = useGetAllFeatures();

  /* ========================= INIT ========================= */
  useEffect(() => {
    if (!formData) return;

    setForm(formData);

    if (formData.icon_path) {
      setPreview(formData.icon_path);
    } else {
      setPreview(null);
    }
  }, [formData?.id]);

  /* ========================= EMIT ========================= */
  useEffect(() => {
    if (!formData?.id) return;

    onChange?.({
      ...form,
      id: formData.id,
    });
  }, [form]);

  /* ========================= CLEANUP ========================= */
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = <K extends keyof IUpdateElementType>(
    field: K,
    value: IUpdateElementType[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

      {/* Name */}
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <Input
          value={form.name ?? ''}
          onChange={(e) => handleChange('name', e.target.value)}
        />
      </div>

      {/* Code */}
      <div>
        <label className="mb-1 block text-sm font-medium">Code</label>
        <Input
          value={form.code ?? ''}
          onChange={(e) => handleChange('code', e.target.value)}
        />
      </div>

      {/* UI TYPE */}
      <div>
        <label className="mb-1 block text-sm font-medium">UI Type</label>
        <Select
          value={form.ui_type}
          onValueChange={(val) => {
            handleChange('ui_type', val);

            // 🔥 reset logic
            if (val === 'asset') {
              handleChange('element_kind', undefined);
            } else {
              handleChange('asset_type', undefined);
            }
          }}
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
          disabled={form.ui_type === 'asset'}
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
          disabled={form.ui_type === 'element'}
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

      {/* FEATURE */}
      <div>
        <label className="mb-1 block text-sm font-medium">Feature</label>
        <ComboboxField
          value={form.feature_key ?? ''}
          items={features}
          getValue={(item) => item.feature_key ?? ''}
          getLabel={(item) => item.feature_key ?? ''}
          placeholder={featuresLoading ? 'Loading...' : 'Pilih fitur'}
          onChange={(val) => handleChange('feature_key', val)}
        />
      </div>

      {/* Width */}
      <div>
        <label className="mb-1 block text-sm font-medium">Default Width</label>
        <Input
          type="number"
          value={form.default_width ?? ''}
          onChange={(e) =>
            handleChange(
              'default_width',
              e.target.value === '' ? undefined : Number(e.target.value)
            )
          }
        />
      </div>

      {/* Height */}
      <div>
        <label className="mb-1 block text-sm font-medium">Default Height</label>
        <Input
          type="number"
          value={form.default_height ?? ''}
          onChange={(e) =>
            handleChange(
              'default_height',
              e.target.value === '' ? undefined : Number(e.target.value)
            )
          }
        />
      </div>

      {/* Rotation */}
      <div>
        <label className="mb-1 block text-sm font-medium">Default Rotation</label>
        <Input
          type="number"
          value={form.default_rotation ?? ''}
          onChange={(e) =>
            handleChange(
              'default_rotation',
              e.target.value === '' ? undefined : Number(e.target.value)
            )
          }
        />
      </div>

      {/* File */}
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Icon / File</label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            handleChange('file_path', file);

            if (preview && preview.startsWith('blob:')) {
              URL.revokeObjectURL(preview);
            }

            const url = URL.createObjectURL(file);
            setPreview(url);
          }}
        />
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