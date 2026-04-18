'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/custom/table/data-table';
import { IconPencil, IconTrash, IconPlus } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';

import { InputSearch } from '@/components/ui/input-search';
import Modal from '@/components/ui/modal-form';
import ErrorFallback from '@/components/fallback/ErrorFallback';
import Loader from '@/components/fallback/Loader';
import { useAlert } from '@/components/alert/alert-dialog-global';
import { useSession } from 'next-auth/react';

import { IRepresentative, ICreateRepresentative, IUpdateRepresentative } from '@/types/representative';
import { useGetAllRepresentatives, createRepresentative, editRepresentative, deleteRepresentative } from '@/hooks/representative';
import AddRepresentativeForm from '../forms/AddRepresentative';
import EditRepresentativeForm from '../forms/EdiRepresentative';


export default function AdminSection() {
    const router = useRouter();
    const alert = useAlert();
    const { data: session } = useSession();

    const organizationId = session?.user?.organization_id;

    const { representatives, representativesLoading, representativesError } = useGetAllRepresentatives(organizationId);
    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [addFormData, setAddFormData] = useState<ICreateRepresentative | null>(null);
    const [editFormData, setEditFormData] = useState<IUpdateRepresentative | null>(null);
    const [initialData, setInitialData] = useState<IUpdateRepresentative | null>(null);

    const getChangedFields = <T extends Record<string, any>>(newData: T, oldData: T) => {
        const changed: Partial<T> = {};
        for (const key in newData) if (newData[key] !== oldData[key]) changed[key] = newData[key];
        return changed;
    };

    const cleanPayload = (obj: Record<string, any>) =>
        Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== '' && v !== null && v !== undefined));

    //=====================HANDLE=========================//
    const handleAddSubmit = async () => {
        if (!addFormData?.name || !addFormData?.title)
            return alert.error('Name dan Title wajib diisi!');
        await alert.confirmAsync('Yakin ingin menambahkan representative ini?', async () => {
            const payload: ICreateRepresentative = { ...addFormData, organization_id: organizationId! };
            const res = await createRepresentative(payload);
            return res
                ? { success: true }
                : { success: false, message: 'Tidak ada response dari server.' };
        });
        // kalau sukses, reset form
        setAddFormData(null);
        setIsAddModalOpen(false);
        localStorage.removeItem('add_representative_form');
    };

    const handleEditSubmit = async () => {
        if (!editFormData?.name || !editFormData?.title) return alert.error('Name dan Title wajib diisi!');
        if (!initialData) return alert.error('Data awal tidak tersedia.');
        await alert.confirmAsync(
            'Yakin ingin menyimpan perubahan representative ini?',
            async () => {
                const changedOnly = getChangedFields(editFormData, initialData);
                const payload: Partial<IUpdateRepresentative> = cleanPayload(changedOnly);
                if (Object.keys(payload).length === 0) {
                    alert.info('Tidak ada perubahan data.');
                    return { success: false, message: 'Tidak ada perubahan' };
                }
                const res = await editRepresentative(editFormData.id!, payload);
                // ubah return editRepresentative jadi object {success, message}
                return { success: !!res, message: res ? 'Representative berhasil diperbarui!' : 'Gagal update representative' };
            }
        );
        setEditFormData(null);
        setInitialData(null);
        setIsEditModalOpen(false);
    };

    const handleOpenEdit = (representative: IRepresentative) => {
        const mapped: IUpdateRepresentative = { id: representative.id, name: representative.name, title: representative.title };
        setEditFormData(mapped); setInitialData(mapped); setIsEditModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        await alert.confirmAsync(`Yakin ingin menghapus "${name}"?`, async () => {
            return await deleteRepresentative(id);
        });
    };

    //=====================================================================

    const tableData = useMemo(() => {
        let data = representatives;
        const q = search.trim().toLowerCase();
        if (q) {
            data = data.filter((u) => `${u.name}`.toLowerCase().includes(q));
        }

        return data;
    }, [representatives, search]);

    const columns = useMemo<ColumnDef<IRepresentative>[]>(() => [
        { header: 'No', cell: ({ row }) => row.index + 1 },
        { header: 'Name', accessorKey: 'name' },
        { header: 'Title', accessorKey: 'title' },
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
                            handleDelete(row.original.id, row.original.name);
                        }}>
                            <IconTrash className='h-4 w-4' />
                        </Button>
                    </div>
                );
            }
        }
    ], []);
    if (representativesLoading) return <div className="p-4 text-center"><Loader /></div>;
    if (representativesError) return <div className="p-4 text-center text-red-500"><ErrorFallback /></div>;

    return (
        <div>
            <h2 className="mb-4 text-lg font-semibold">Daftar Representatives</h2>
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="w-full max-w-[320px]">
                    <InputSearch placeholder="name..." value={search}
                        onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setIsAddModalOpen(true)}>
                        <IconPlus className="h-4 w-4" /> Tambah Representatives
                    </Button>
                </div>
            </div>
            <DataTable columns={columns} data={tableData} filterField="email" isRemovePagination={false}
                rowProps={row => ({
                    onClick: () => router.push(`/admin/users/${row.original.id}`),
                    className: 'cursor-pointer transition-colors hover:bg-black/[0.02] active:bg-black/[0.03]',
                })}
            />
            <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddSubmit} title="Tambah Representative">
                <AddRepresentativeForm formData={addFormData ?? undefined} onChange={data =>
                    setAddFormData(prev => JSON.stringify(prev) !== JSON.stringify(data) ? (data as ICreateRepresentative) : prev
                    )} />
            </Modal>
            <Modal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                title="Edit Representative"
            >
                {editFormData && (
                    <EditRepresentativeForm
                        representativeData={editFormData}
                        onChange={(data: IUpdateRepresentative) =>
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