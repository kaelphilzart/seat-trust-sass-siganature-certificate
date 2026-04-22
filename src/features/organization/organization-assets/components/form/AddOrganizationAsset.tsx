'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { ICreateOrganizationAsset, AssetType } from '@/types/organization';

interface AddOrganizationAssetFormProps {
  formData?: ICreateOrganizationAsset;
  onChange?: (data: ICreateOrganizationAsset) => void;
}

const STORAGE_KEY = 'add_organization_asset_form';

export default function AddOrganizationAssetForm({
  formData,
  onChange,
}: AddOrganizationAssetFormProps) {
  const [form, setForm] = useState<ICreateOrganizationAsset>(formData ?? {});
  const [preview, setPreview] = useState<string | null>(null);

  /* ===== SAVE DRAFT ===== */
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

  const handleChange = <K extends keyof ICreateOrganizationAsset>(
    field: K,
    value: ICreateOrganizationAsset[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* NAME */}
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <Input
          type="text"
          value={form.name ?? ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Nama Asset"
        />
      </div>

      {/* TYPE */}
      <div>
        <label className="mb-1 block text-sm font-medium">Type</label>
        <select
          className="w-full border rounded px-2 py-2"
          value={form.type ?? ''}
          onChange={(e) => handleChange('type', e.target.value as AssetType)}
        >
          <option value="">Pilih type</option>
          <option value="IMAGE">Image</option>
          <option value="LOGO">Logo</option>
          <option value="FONT">Font</option>
        </select>
      </div>

      {/* FILE */}
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">File</label>
        <Input
          type="file"
          accept="image/*,.ttf,.woff,.woff2"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            // ✅ FIX: pakai field 'file'
            handleChange('file', file);

            // preview hanya untuk image
            if (file.type.startsWith('image/')) {
              const url = URL.createObjectURL(file);
              setPreview(url);
            } else {
              setPreview(null);
            }
          }}
        />

        {/* nama file */}
        {form.file && <p className="text-sm mt-1">{form.file.name}</p>}
      </div>

      {/* PREVIEW */}
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
