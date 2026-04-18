'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import {
  IUpdateOrganizationAsset,
  AssetType,
} from '@/types/organization';

interface EditOrganizationAssetFormProps {
  formData?: IUpdateOrganizationAsset;
  onChange?: (data: IUpdateOrganizationAsset) => void;
}

export default function EditOrganizationAssetForm({
  formData,
  onChange,
}: EditOrganizationAssetFormProps) {
  const [form, setForm] = useState<IUpdateOrganizationAsset>({});
  const [preview, setPreview] = useState<string | null>(null);

  /* =========================
     INIT (CUMA SAAT OPEN / GANTI DATA)
  ========================= */
  useEffect(() => {
    if (!formData) return;

    setForm(formData);

    // preview dari existing file_path
    if (formData.file_path) {
      setPreview(formData.file_path);
    } else {
      setPreview(null);
    }
  }, [formData?.id]);

  /* =========================
     EMIT CHANGE KE PARENT
  ========================= */
  useEffect(() => {
    if (!formData?.id) return;

    onChange?.({
      ...form,
      id: formData.id,
    });
  }, [form]);

  /* =========================
     CLEANUP BLOB
  ========================= */
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = <K extends keyof IUpdateOrganizationAsset>(
    field: K,
    value: IUpdateOrganizationAsset[K]
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
        />
      </div>

      {/* TYPE */}
      <div>
        <label className="mb-1 block text-sm font-medium">Type</label>
        <select
          className="w-full border rounded px-2 py-2"
          value={form.type ?? ''}
          onChange={(e) =>
            handleChange('type', e.target.value as AssetType)
          }
        >
          <option value="">Pilih type</option>
          <option value="IMAGE">Image</option>
          <option value="LOGO">Logo</option>
          <option value="FONT">Font</option>
        </select>
      </div>

      {/* FILE */}
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Replace File</label>
        <Input
          type="file"
          accept="image/*,.ttf,.woff,.woff2"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            // ✅ FIX: pakai field 'file'
            handleChange('file', file);

            // cleanup preview lama
            if (preview && preview.startsWith('blob:')) {
              URL.revokeObjectURL(preview);
            }

            // preview hanya image
            if (file.type.startsWith('image/')) {
              const url = URL.createObjectURL(file);
              setPreview(url);
            } else {
              setPreview(null);
            }
          }}
        />
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