'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/custom/table/data-table';
import { IconTrash, IconPlus, IconPencil } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { useAlert } from '@/components/alert/alert-dialog-global';
import ErrorFallback from '@/components/fallback/ErrorFallback';
import Loader from '@/components/fallback/Loader';
import { InputSearch } from '@/components/ui/input-search';
import Modal from '@/components/ui/modal-form';
import AddElementTypeForm from '../form/AddElementType';
import EditElementTypeForm from '../form/EditElementType';

import { useGetAllElementType, deleteElementType, editElementType, createElementType } from '@/hooks/element-type';
import { IElementType, ICreateElementType, IUpdateElementType } from '@/types/element-type';
import { encodeId } from '@/utils/encode';
import { Badge } from '@/components/ui/badge';

export default function ElementTypeSection() {
    const router = useRouter();
    const alert = useAlert();
    const { elementTypes, elementTypesError, elementTypesLoading } = useGetAllElementType();

    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addFormData, setAddFormData] = useState<ICreateElementType | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<IUpdateElementType | null>(null);
    const [initialData, setInitialData] = useState<IUpdateElementType | null>(null);

    const getChangedFields = <T extends Record<string, any>>(newData: T, oldData: T) => {
        const changed: Partial<T> = {};

        for (const key in newData) {
            const newVal = newData[key];
            const oldVal = oldData[key];

            // skip undefined
            if (newVal === undefined) continue;

            // normalize
            const n = newVal === '' ? undefined : newVal;
            const o = oldVal === '' ? undefined : oldVal;

            if (n !== o) {
                changed[key] = newVal;
            }
        }

        return changed;
    };

    const cleanPayload = (obj: Record<string, any>) =>
        Object.fromEntries(
            Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        );

    //=====================HANDLE=========================//
    const handleDelete = async (id: string, name: string) => {
        await alert.confirmAsync(`Yakin ingin menghapus "${name}"?`, async () => {
            return await deleteElementType(id);
        });
    };

    const handleAddSubmit = async () => {
        if (!addFormData?.name || !addFormData?.file_path)
            return alert.error('Name dan File wajib diisi!');

        await alert.confirmAsync('Yakin ingin menambahkan element type ini?', async () => {
            const payload: ICreateElementType & { file: File } = {
                ...addFormData,
                file: addFormData.file_path!,
            };

            const res = await createElementType(payload);
            return res.success
                ? { success: true }
                : { success: false, message: res.message || 'Tidak ada response dari server.' };
        });

        setAddFormData(null);
        setIsAddModalOpen(false);
        localStorage.removeItem('add_element_form');
    };

    const handleEditSubmit = async () => {
        if (!editFormData?.id) return alert.error('Data tidak lengkap!');
        if (!initialData) return alert.error('Data awal tidak tersedia.');

        await alert.confirmAsync('Yakin ingin menyimpan perubahan?', async () => {
            const changedOnly = getChangedFields(editFormData, initialData);
            const payload: Partial<IUpdateElementType> = cleanPayload(changedOnly);

            if (Object.keys(payload).length === 0) {
                alert.info('Tidak ada perubahan data.');
                return { success: false, message: 'Tidak ada perubahan' };
            }

            const res = await editElementType(editFormData.id!, payload);
            return { success: res.success, message: res.message };
        });

        setEditFormData(null);
        setInitialData(null);
        setIsEditModalOpen(false);
    };

    const handleOpenEdit = (element: IElementType) => {
        const mapped: IUpdateElementType = {
            id: element.id,
            name: element.name,
            code: element.code,
            default_width: element.default_width,
            default_height: element.default_height,
            default_rotation: element.default_rotation,
            feature_key: element.feature_key,
            ui_type: element.ui_type,
            element_kind: element.element_kind,
            asset_type: element.asset_type,
            icon_path: element.icon_path,
        };
        setEditFormData(mapped);
        setInitialData(mapped);
        setIsEditModalOpen(true);
    };

    //=====================================================================
    const tableData = useMemo(() => {
        let data = elementTypes;
        const q = search.trim().toLowerCase();
        if (q) data = data.filter((f) => `${f.name}`.toLowerCase().includes(q));
        return data;
    }, [elementTypes, search]);

    const columns = useMemo<ColumnDef<IElementType>[]>(() => [
        { header: 'No', cell: ({ row }) => row.index + 1, size: 50 },
        { header: 'Name', accessorKey: 'name', size: 250 },
        { header: 'Code', accessorKey: 'code', size: 200 },
        { header: 'Feature', accessorKey: 'feature_key', size: 200 },
        {
            header: 'Icon',
            accessorKey: 'icon_path',
            size: 150,
            cell: ({ row }) => {
                const url = row.original.icon_path;
                return url ? (
                    <Image
                        src={url}
                        alt={row.original.name ?? ''}
                        width={8}
                        height={8}
                        className="h-8 w-8 rounded object-cover border"
                    />
                ) : (
                    <Badge variant="destructive">Tidak Ada</Badge>
                );
            }
        },
        { header: 'Width', accessorKey: 'default_width', size: 50 },
        { header: 'Height', accessorKey: 'default_height', size: 50 },
        { header: 'Rotation', accessorKey: 'default_rotation', size: 50 },
        {
            header: 'Aksi',
            id: 'actions',
            size: 120,
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={e => {
                            e.stopPropagation();
                            handleOpenEdit(row.original);
                        }}
                    >
                        <IconPencil className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={e => {
                            e.stopPropagation();
                            handleDelete(row.original.id!, row.original.name!);
                        }}
                    >
                        <IconTrash className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    ], []);

    if (elementTypesLoading) return <Loader />;
    if (elementTypesError) return <ErrorFallback />;

    return (
        <div>
            <h2 className="mb-4 text-lg font-semibold">Daftar Element Types</h2>

            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="w-full max-w-[320px]">
                    <InputSearch placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setIsAddModalOpen(true)}>
                        <IconPlus className="h-4 w-4" /> Tambah Element Type
                    </Button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={tableData}
                filterField="name"
                isRemovePagination={false}
            />

            <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddSubmit} title="Tambah Element Type">
                <AddElementTypeForm formData={addFormData ?? undefined} onChange={data =>
                    setAddFormData(prev => JSON.stringify(prev) !== JSON.stringify(data) ? (data as ICreateElementType) : prev
                    )} />
            </Modal>


            <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEditSubmit} title="Edit Element Type">
                {editFormData && (
                    <EditElementTypeForm
                        formData={editFormData}
                        onChange={(data: IUpdateElementType) =>
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