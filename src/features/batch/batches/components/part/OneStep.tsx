'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAlert } from '@/components/alert/alert-dialog-global';
import { IconArrowLeft } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { paths } from '@/routes/paths';

type Props = {
    data: {
        name: string;
        start_date: string;
        end_date: string;
    };
    onChange: (val: Props['data']) => void;
    onNext: () => void;
    isDirty: boolean;
};

export default function OneStep({
    data,
    onChange,
    onNext,
    isDirty,
}: Props) {
    const router = useRouter();
    const alert = useAlert();

    /* ================= BLOCK TAB CLOSE ================= */
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isDirty) return;
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    /* ================= BACK ================= */
    const handleBack = async () => {
        if (!isDirty) return router.push(paths.batch.base);

        await alert.confirmAsync(
            'Yakin mau keluar? Data event akan hilang.',
            async () => {
                router.push(paths.batch.base);
                return { success: true };
            }
        );
    };

    const handleChange = (field: string, value: string) => {
        onChange({
            ...data,
            [field]: value,
        });
    };

    const handleNext = () => {
        if (!data.name || !data.start_date || !data.end_date) {
            alert.error('Semua field wajib diisi!');
            return;
        }

        if (data.start_date > data.end_date) {
            alert.error('Start date ga boleh lebih dari end date!');
            return;
        }

        onNext();
    };

    return (
        <div className="mx-auto max-w-4xl p-6">
            {/* HEADER */}
            <div className="mb-6 flex items-center justify-between">
                <Button variant="ghost" onClick={handleBack}>
                    <IconArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                </Button>

                <div className="text-sm text-black/45">
                    Step 1 — Informasi Event
                </div>
            </div>

            <Card className="p-6 space-y-5">
                {/* NAME */}
                <div>
                    <label className="text-sm font-medium">Nama Event</label>
                    <Input
                        value={data.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="mt-1 w-full rounded-lg border px-3 py-2"
                        placeholder='Nama event'
                    />
                </div>

                {/* DATE */}
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        type="date"
                        value={data.start_date}
                        onChange={(e) =>
                            handleChange('start_date', e.target.value)
                        }
                    />
                    <Input
                        type="date"
                        value={data.end_date}
                        onChange={(e) =>
                            handleChange('end_date', e.target.value)
                        }
                    />
                </div>

                {/* NEXT */}
                <div className="flex justify-end">
                    <Button onClick={handleNext}>Next →</Button>
                </div>
            </Card>
        </div>
    );
}