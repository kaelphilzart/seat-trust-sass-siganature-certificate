'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Trash2, Play, ArrowLeft } from 'lucide-react';

import ErrorFallback from '@/components/fallback/ErrorFallback';
import Loader from '@/components/fallback/Loader';

import { useGetOneTemplate } from '@/hooks/template';

export interface Props {
    templateId: string;
}

export default function PlanDynamic({ templateId }: Props) {
    const router = useRouter();

    const { templateOne, templateOneLoading, templateOneError } = useGetOneTemplate(templateId);

    if (templateOneLoading) return <div className="p-4 text-center"><Loader /></div>;
    if (templateOneError) return <div className="p-4 text-center text-red-500"><ErrorFallback /></div>;

    const handleDownload = () => {
        if (templateOne?.file_path) {
            window.open(templateOne.file_path, '_blank');
        }
    };

    // const handleUse = () => {
    //     router.push(`/documents/create?template_id=${templateOne.id}`);
    // };

    // const handleDelete = () => {
    //     // TODO: connect API delete
    //     console.log('delete:', templateOne.id);
    // };

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-6">

            {/* BACK */}
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="gap-2"
            >
                <ArrowLeft size={16} />
                Kembali
            </Button>

            {/* PREVIEW */}
            <Card className="overflow-hidden border border-border bg-card">
                <div className="relative w-full h-[420px] bg-muted">
                    {templateOne?.file_path ? (
                        <>
                            <Image
                                src={templateOne.file_path}
                                alt={templateOne.name ?? 'template'}
                                fill
                                className="object-contain"
                            />
                            <div className="absolute inset-0 bg-black/5 dark:bg-black/20" />
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            No Preview
                        </div>
                    )}
                </div>
            </Card>

            {/* INFO */}
            <div className="space-y-2">
                <h1 className="text-xl font-semibold text-foreground">
                    {templateOne?.name}
                </h1>

                <p className="text-sm text-muted-foreground">
                    Template ini dapat digunakan untuk membuat dokumen baru dengan format yang sudah disiapkan.
                </p>

                {templateOne?.created_at && (
                    <p className="text-xs text-muted-foreground">
                        Dibuat:{' '}
                        {new Date(templateOne.created_at).toLocaleDateString()}
                    </p>
                )}
            </div>

            {/* ACTION */}
            <div className="flex flex-wrap gap-3">
                <Button
                    // onClick={handleUse} 
                    className="gap-2">
                    <Play size={16} />
                    Gunakan Template
                </Button>

                <Button
                    variant="secondary"
                    onClick={handleDownload}
                    className="gap-2"
                >
                    <Download size={16} />
                    Download
                </Button>

                <Button
                    variant="destructive"
                    // onClick={handleDelete}
                    className="gap-2"
                >
                    <Trash2 size={16} />
                    Hapus
                </Button>
            </div>
        </div>
    );
}