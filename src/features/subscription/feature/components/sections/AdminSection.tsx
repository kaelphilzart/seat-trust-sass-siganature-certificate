'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/custom/table/data-table';
import { IconPencil, IconTrash, IconPlus } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { useAlert } from '@/components/alert/alert-dialog-global';
import { InputSearch } from '@/components/ui/input-search';
import Modal from '@/components/ui/modal-form';
import ErrorFallback from '@/components/fallback/ErrorFallback';
import Loader from '@/components/fallback/Loader';

import { IFeature, ICreateFeature, IUpdateFeature } from '@/types/feature';
import { useGetAllFeatures, createFeature, editFeature, deleteFeature } from '@/hooks/features';

import AddFeatureForm from '../form/AddFeature';
import EditFeatureForm from '../form/EditFeature';


export default function AdminSection() {
    const router = useRouter();
    const alert = useAlert();
    const { features, featuresLoading, featuresError } = useGetAllFeatures();
    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [addFormData, setAddFormData] = useState<ICreateFeature | null>(null);
    const [editFormData, setEditFormData] = useState<IUpdateFeature | null>(null);
    const [initialData, setInitialData] = useState<IUpdateFeature | null>(null);

    const getChangedFields = <T extends Record<string, any>>(newData: T, oldData: T) => {
        const changed: Partial<T> = {};
        for (const key in newData) if (newData[key] !== oldData[key]) changed[key] = newData[key];
        return changed;
    };

    const cleanPayload = (obj: Record<string, any>) =>
        Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== '' && v !== null && v !== undefined));

    //=====================HANDLE=========================//
    const handleAddSubmit = async () => {
        if (!addFormData?.feature_key || !addFormData?.display_name || !addFormData?.feature_type)
            return alert.error('Key, Type  and display name  wajib diisi!');
        await alert.confirmAsync('Yakin ingin menambahkan feature ini?', async () => {
            const payload: ICreateFeature = { ...addFormData };
            const res = await createFeature(payload);
            return res
                ? { success: true }
                : { success: false, message: 'Tidak ada response dari server.' };
        });
        setAddFormData(null);
        setIsAddModalOpen(false);
        localStorage.removeItem('add_feature_form');
    };

    const handleEditSubmit = async () => {
        if (!editFormData?.feature_key) return alert.error('Feature key wajib diisi!');
        if (!initialData) return alert.error('Data awal tidak tersedia.');
        await alert.confirmAsync(
            'Yakin ingin menyimpan perubahan feature ini?',
            async () => {
                const changedOnly = getChangedFields(editFormData, initialData);
                const payload: Partial<IUpdateFeature> = cleanPayload(changedOnly);
                if (Object.keys(payload).length === 0) {
                    alert.info('Tidak ada perubahan data.');
                    return { success: false, message: 'Tidak ada perubahan' };
                }
                const res = await editFeature(editFormData.id!, payload);
                return { success: !!res, message: res ? 'Feature berhasil diperbarui!' : 'Gagal update feature' };
            }
        );
        setEditFormData(null);
        setInitialData(null);
        setIsEditModalOpen(false);
    };

    const handleOpenEdit = (feature: IFeature) => {
        const mapped: IUpdateFeature = { id: feature.id, feature_key: feature.feature_key, 
            display_name: feature.display_name, description: feature.description, 
            feature_type: feature.feature_type, category: feature.category };
        setEditFormData(mapped); setInitialData(mapped); setIsEditModalOpen(true);
    };

    const handleDelete = async (id: string, feature_key: string) => {
        await alert.confirmAsync(`Yakin ingin menghapus "${feature_key}"?`, async () => {
            return await deleteFeature(id);
        });
    };

//=====================================================================

    const tableData = useMemo(() => {
        let data = features;
        const q = search.trim().toLowerCase();
        if (q) {
            data = data.filter((f) => `${f.feature_key}`.toLowerCase().includes(q));
        }

        return data;
    }, [features, search]);

    const columns = useMemo<ColumnDef<IFeature>[]>(() => [
        { header: 'No', cell: ({ row }) => row.index + 1 },
        { header: 'Feature Key', accessorKey: 'feature_key' },
        { header: 'Display Name', accessorKey: 'display_name' },
        { header: 'Description', accessorKey: 'description' },
        { header: 'Type', accessorKey: 'feature_type' },
        { header: 'Category', accessorKey: 'category' },
        {
            header: 'Aksi', id: 'actions', cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); handleOpenEdit(row.original) }}>
                            <IconPencil className='h-4 w-4' />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.original.id ?? '', row.original.feature_key?.toString() ?? '');
                        }}>
                            <IconTrash className='h-4 w-4' />
                        </Button>
                    </div>
                );
            }
        }
    ], []);
    if (featuresLoading) return <div className="p-4 text-center"><Loader /></div>;
    if (featuresError) return <div className="p-4 text-center text-red-500"><ErrorFallback /></div>;

    return (
        <div>
            <h2 className="mb-4 text-lg font-semibold">Daftar Features</h2>
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="w-full max-w-[320px]">
                    <InputSearch placeholder="feature key..." value={search}
                        onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setIsAddModalOpen(true)}>
                        <IconPlus className="h-4 w-4" /> Tambah Features
                    </Button>
                </div>
            </div>
            <DataTable columns={columns} data={tableData} filterField="feature_key" isRemovePagination={false}
                rowProps={row => ({
                    onClick: () => router.push(`/admin/users/${row.original.id}`),
                    className: 'cursor-pointer transition-colors hover:bg-black/[0.02] active:bg-black/[0.03]',
                })}
            />
            <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddSubmit} title="Tambah Feature">
                <AddFeatureForm formData={addFormData ?? undefined} onChange={data =>
                    setAddFormData(prev => JSON.stringify(prev) !== JSON.stringify(data) ? (data as ICreateFeature) : prev
                    )} />
            </Modal>
            <Modal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                title="Edit Feature"
            >
                {editFormData && (
                    <EditFeatureForm
                        formData={editFormData}
                        onChange={(data: IUpdateFeature) =>
                            setEditFormData((prev) =>
                                JSON.stringify(prev) !== JSON.stringify(data) ? data : prev
                            )
                        }
                    />
                )}
            </Modal>
        </div>
    );
}