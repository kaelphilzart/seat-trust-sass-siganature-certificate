'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { IUpdateOrganizationAsset, AssetType } from '@/types/organization';

interface EditOrganizationAssetFormProps {
  formData?: IUpdateOrganizationAsset;
  onChange?: (data: IUpdateOrganizationAsset) => void;
}

export default function EditOrganizationAssetForm({
  formData,
  onChange,
}: EditOrganizationAssetFormProps) {
  const [form, setForm] = useState<IUpdateOrganizationAsset>(() => ({
    ...(formData ?? {}),
  }));

  const [preview, setPreview] = useState<string | null>(
    formData?.file_path ?? null
  );

  /* =========================
     HANDLER UPDATE FIELD
  ========================= */
  const handleChange = <K extends keyof IUpdateOrganizationAsset>(
    field: K,
    value: IUpdateOrganizationAsset[K]
  ) => {
    const updated = {
      ...form,
      [field]: value,
    };

    setForm(updated);

    onChange?.({
      ...updated,
      id: formData?.id,
    });
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
        <label className="mb-1 block text-sm font-medium">Replace File</label>

        <Input
          type="file"
          accept="image/*,.ttf,.woff,.woff2"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            handleChange('file', file);

            if (preview?.startsWith('blob:')) {
              URL.revokeObjectURL(preview);
            }

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
