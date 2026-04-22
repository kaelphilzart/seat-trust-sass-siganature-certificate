'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAlert } from '@/components/alert/alert-dialog-global';
import { handleAsync } from '@/utils/utilsUI';
import { IconArrowLeft, IconUpload, IconPlus } from '@tabler/icons-react';
import { createTemplate } from '@/hooks/template';
import { paths } from '@/routes/paths';

export default function CreatePage() {
  const router = useRouter();
  const alert = useAlert();

  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isDirty = !!name || !!file;

  /* ================= WARNING TAB CLOSE ================= */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  /* ================= CLEAN PREVIEW ================= */
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* ================= HANDLE FILE ================= */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  /* ================= BACK ================= */
  const handleBack = async () => {
    if (!isDirty) return router.back();

    await alert.confirmAsync(
      'Yakin mau keluar? Data akan hilang.',
      async () => {
        router.back();
        return { success: true };
      }
    );
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (loading) return;
    if (!name) return alert.error('Nama template wajib diisi!');
    if (!file) return alert.error('File template wajib diupload!');

    await alert.confirmAsync(
      'Yakin ingin menyimpan template ini?',
      handleAsync(async () => {
        setLoading(true);
        try {
          await createTemplate({ name, file });
          router.push(paths.template.base);
        } finally {
          setLoading(false);
        }
      })
    );
  };

  /* ================= UI ================= */
  return (
    <div className="p-4 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <IconArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <Button onClick={handleSubmit} disabled={loading}>
          <IconPlus className="w-4 h-4" />
          {loading ? 'Menyimpan...' : 'Simpan Template'}
        </Button>
      </div>

      {/* FORM */}
      <Card className="p-4 space-y-4">
        {/* NAME */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Nama Template</label>
          <Input
            placeholder="Contoh: Sertifikat Webinar 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* UPLOAD */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Upload Template</label>

          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-[200px] cursor-pointer hover:bg-gray-50 transition">
            <IconUpload className="h-6 w-6 mb-2 text-gray-500" />
            <span className="text-sm text-gray-500">
              Klik atau drag file ke sini
            </span>

            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* PREVIEW */}
        {preview && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview</label>

            <div className="relative w-full h-[300px] border rounded overflow-hidden">
              <Image
                src={preview}
                alt="preview"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
