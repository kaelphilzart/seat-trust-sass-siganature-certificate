'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IconArrowLeft, IconUpload } from '@tabler/icons-react';
import { useGetAllTemplate } from '@/hooks/template';
import TemplateCarousel, { Template } from '@/components/custom/Carousel';

type TwoStepProps = {
  event: {
    name: string;
    start_date: string;
    end_date: string;
  };
  templateId?: string | null;
  organizationId: string | null; // <-- tambahin props
  onSelectTemplate: (id: string) => void;
  onBack: () => void;
  onSubmit: () => void;
};

export default function TwoStep({
  templateId,
  organizationId,
  onSelectTemplate,
  onBack,
  onSubmit,
}: TwoStepProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
    templateId || null
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { templates, templatesError, templatesLoading } = useGetAllTemplate(
    organizationId ?? undefined
  );

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplate(id);
    onSelectTemplate(id);
  };

  const handleUploadTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack}>
          <IconArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <div className="text-sm text-black/45">Step 2 — Template</div>
      </div>

      {/* TEMPLATE SELECTOR */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Pilih Template</div>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <IconUpload /> Upload Template
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleUploadTemplate}
            />
          </label>
        </div>

        {templatesLoading ? (
          <div className="text-sm text-gray-500">Memuat template…</div>
        ) : templatesError ? (
          <div className="text-sm text-red-500">
            Gagal memuat template: {templatesError.message}
          </div>
        ) : templates && templates.length > 0 ? (
          <TemplateCarousel
            templates={templates as Template[]}
            selectedId={selectedTemplate}
            onSelect={handleSelectTemplate}
          />
        ) : (
          <div className="text-sm text-gray-500">
            Belum ada template tersedia
          </div>
        )}
      </div>

      {/* ACTION */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onBack}>
          Kembali
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!selectedTemplate && !uploadedFile}
        >
          Submit Batch
        </Button>
      </div>
    </div>
  );
}
