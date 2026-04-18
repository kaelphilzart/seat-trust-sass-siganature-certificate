'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconUser, IconTrash, IconPlus, IconLoader2, IconArrowLeft, IconArrowDown } from '@tabler/icons-react';
import { ICreateParticipant, IParticipant } from '@/types/participant';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/components/alert/alert-dialog-global';
import {
    useGetAllParticipants,
    createBulkParticipants,
    deleteBulkParticipants,
} from '@/hooks/participant';
import { downloadCertificateBulk } from '@/hooks/certificate';
import { paths } from '@/routes/paths';
import { encodeId } from '@/utils/encode';
import { Badge } from '@/components/ui/badge';

export interface Props {
    batchId: string;
}

export default function CreateParticipant({ batchId }: Props) {
    const { participants } = useGetAllParticipants(batchId);
    const router = useRouter();
    const alert = useAlert();

    /* ================= FORM STATE ================= */
    const [form, setForm] = useState<ICreateParticipant>({
        name: '',
        email: '',
        batch_id: batchId,
    });

    /* ================= UI STATE ================= */
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [loadingDownload, setLoadingDownload] = useState(false);

    const data: IParticipant[] = participants ?? [];

    /* ================= DIRTY CHECK ================= */
    const isDirty = useMemo(() => {
        return form.name.trim() !== '' || form.email.trim() !== '';
    }, [form]);

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

    /* ================= HANDLE ================= */
    const handleAdd = async () => {
        if (!form.name.trim() || !form.email.trim()) return;
        if (loading) return;

        setLoading(true);

        try {
            await createBulkParticipants([
                {
                    name: form.name,
                    email: form.email,
                    batch_id: batchId,
                },
            ]);

            setForm({
                name: '',
                email: '',
                batch_id: batchId,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /* ================= BACK ================= */
    const handleBack = async () => {
        if (!isDirty) return router.push(`${paths.batch.base}/${encodeId(batchId)}`);

        await alert.confirmAsync(
            'Yakin mau keluar? Data tidak akan tersimpan.',
            async () => {
                router.push(`${paths.batch.base}/${encodeId(batchId)}`);
                return { success: true };
            }
        );
    };

    const handleDelete = async () => {
        if (!selectedIds.length) return;
        if (loadingDelete) return;

        setLoadingDelete(true);

        try {
            await deleteBulkParticipants(selectedIds);

            setSelectedIds([]);
            setIsAllSelected(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDelete(false);
        }
    };

    const handleDownloadBulk = async () => {
        if (!batchId || selectedIds.length === 0) return;
        if (loadingDownload) return;

        setLoadingDownload(true);

        try {
            await downloadCertificateBulk(batchId, selectedIds);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDownload(false);
        }
    };


    /* ================= SELECT SINGLE ================= */
    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    /* ================= SELECT ALL ================= */
    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
            setIsAllSelected(false);
        } else {
            setSelectedIds(data.map((p) => p.id));
            setIsAllSelected(true);
        }
    };

    /* ================= SYNC SELECT ALL ================= */
    useEffect(() => {
        if (
            selectedIds.length > 0 &&
            selectedIds.length === data.length
        ) {
            setIsAllSelected(true);
        } else {
            setIsAllSelected(false);
        }
    }, [selectedIds, data]);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={handleBack}>
                    <IconArrowLeft className='w-4 h-4' />
                    Kembali</Button>
            </div>

            {/* FORM */}
            <div className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-800 p-4 rounded shadow-md space-y-2">
                <div className="flex flex-col items-center justify-center gap-2">
                    <IconUser className="w-12 h-12 text-green-600" />
                    <div className="text-lg font-medium">
                        Tambah participant baru
                    </div>
                </div>

                {/* INPUT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                        type="text"
                        placeholder="Nama participant"
                        value={form.name}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                            }))
                        }
                    />

                    <Input
                        type="email"
                        placeholder="Email participant"
                        value={form.email}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                email: e.target.value,
                            }))
                        }
                    />
                </div>

                {/* ACTION */}
                <div className="flex justify-end gap-2">
                    <Button onClick={handleAdd} disabled={loading}>
                        <IconUser className="w-4 h-4" />
                        {loading ? (
                            <IconLoader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <IconPlus className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* LIST */}
            <div className="text-center">
                <Badge variant='lightSuccess'>
                    ALL PARTICIPANT
                </Badge>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2 space-y-2">

                {/* HEADER LIST */}
                <div className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">

                    {/* SELECT ALL */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={toggleSelectAll}
                            className="w-4 h-4"
                        />
                        Select All
                    </label>

                    <div className="flex items-center gap-2">

                        {/* DOWNLOAD BULK */}
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleDownloadBulk}
                            disabled={selectedIds.length === 0 || loadingDownload}
                        >
                            {loadingDownload ? (
                                <IconLoader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                                <IconArrowDown className="w-4 h-4 mr-1" />
                            )}
                            Participant
                            ({selectedIds.length})
                        </Button>

                        {/* DELETE */}
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleDelete}
                            disabled={selectedIds.length === 0 || loadingDelete}
                        >
                            {loadingDelete ? (
                                <IconLoader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                                <IconTrash className="w-4 h-4 mr-1" />
                            )}
                            ({selectedIds.length})
                        </Button>

                    </div>
                </div>

                {/* LIST ITEMS */}
                <div className="space-y-2">

                    {data.map((p) => (
                        <div
                            key={p.id}
                            className="flex items-center border border-gray-200 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-900">

                            <input
                                type="checkbox"
                                checked={selectedIds.includes(p.id)}
                                onChange={() => toggleSelect(p.id)}
                                className="w-4 h-4"
                            />

                            <div className="ml-3">
                                <div className="font-medium">{p.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {p.email}
                                </div>
                            </div>

                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}