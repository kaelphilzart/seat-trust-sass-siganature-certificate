'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/custom/table/data-table';
import { IconTrash, IconPlus, IconPencil } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { useAlert } from '@/components/alert/alert-dialog-global';
import ErrorFallback from '@/components/fallback/ErrorFallback';
import Loader from '@/components/fallback/Loader';
import { InputSearch } from '@/components/ui/input-search';
import Modal from '@/components/ui/modal-form';
import { useGetAllOrganizations, deleteOrganization, editOrganization } from '@/hooks/organizations';
import { IOrganization, ICreateOrganization, IUpdateOrganization } from '@/types/organization';
import { createOrganization } from '@/hooks/organizations';
import { encodeId } from '@/utils/encode';
import { ICreateSubscription, IUpdateSubscription } from '@/types/subscription';
import { editSubscription } from '@/hooks/subscription';
import AddOrganizationForm from '../form/AddOrganization';
import EditOrganizationForm from '../form/EditOrganization';
import { Badge } from '@/components/ui/badge';


export default function AdminSection() {
    const router = useRouter();
    const alert = useAlert();
    const { organizations, organizationsLoading, organizationsError } = useGetAllOrganizations();
    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addFormData, setAddFormData] = useState<ICreateOrganization | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<IUpdateOrganization | null>(null);
    const [initialData, setInitialData] = useState<IUpdateOrganization | null>(null);
    const [subscriptionFormData, setSubscriptionFormData] = useState<Partial<ICreateSubscription>>({});
    const [editSubscriptionData, setEditSubscriptionData] = useState<Partial<ICreateSubscription>>({});
    const [initialSubscriptionData, setInitialSubscriptionData] = useState<Partial<ICreateSubscription> | null>(null);

    const getChangedFields = <T extends Record<string, any>>(newData: T, oldData: T) => {
        const changed: Partial<T> = {};
        for (const key in newData) if (newData[key] !== oldData[key]) changed[key] = newData[key];
        return changed;
    };

    const cleanPayload = (obj: Record<string, any>) =>
        Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== '' && v !== null && v !== undefined));

    //=====================HANDLE=========================//
    const handleDelete = async (id: string, name: string) => {
        await alert.confirmAsync(`Yakin ingin menghapus "${name}"?`, async () => {
            return await deleteOrganization(id);
        });
    };

    const handleAddSubmit = async () => {
        if (!addFormData?.name || !addFormData?.slug)
            return alert.error('Name and Slug wajib diisi!');
        if (!subscriptionFormData?.plan_id || !subscriptionFormData?.start_date || !subscriptionFormData?.end_date)
            return alert.error('Plan, Start date, dan End date wajib diisi!');

        if (!subscriptionFormData?.plan_id)
            return alert.error('Plan wajib dipilih!');

        await alert.confirmAsync('Yakin ingin menambahkan organization ini?', async () => {

            const orgPayload: ICreateOrganization = { ...addFormData };

            const subscriptionPayload: ICreateSubscription = {
                plan_id: subscriptionFormData.plan_id!,
                start_date: subscriptionFormData.start_date!,
                end_date: subscriptionFormData.end_date!,
                status: true,
            };

            const res = await createOrganization(orgPayload, subscriptionPayload);

            if (res) {
                setAddFormData(null);
                setSubscriptionFormData({});
                setIsAddModalOpen(false);
            }

            return res
                ? { success: true }
                : { success: false, message: 'Tidak ada response dari server.' };
        });
    };

    const handleEditSubmit = async () => {
        if (!editFormData?.name)
            return alert.error('Organization name wajib diisi!');
        if (!initialData)
            return alert.error('Data awal tidak tersedia.');
        await alert.confirmAsync(
            'Yakin ingin menyimpan perubahan organization ini?',
            async () => {
                /* ================= ORGANIZATION ================= */
                const changedOrg = getChangedFields(editFormData, initialData);
                const orgPayload: Partial<IUpdateOrganization> = cleanPayload(changedOrg);
                /* ================= SUBSCRIPTION ================= */
                const changedSub = initialSubscriptionData
                    ? getChangedFields(editSubscriptionData, initialSubscriptionData)
                    : {};

                const subPayload: Partial<IUpdateSubscription> = cleanPayload(changedSub);
                /* ================= CEK PERUBAHAN ================= */
                if (
                    Object.keys(orgPayload).length === 0 &&
                    Object.keys(subPayload).length === 0
                ) {
                    alert.info('Tidak ada perubahan data.');
                    return { success: false };
                }
                try {
                    /* ================= UPDATE ORGANIZATION ================= */
                    const orgRes =
                        Object.keys(orgPayload).length > 0
                            ? await editOrganization(editFormData.id!, orgPayload)
                            : true;
                    /* ================= UPDATE SUBSCRIPTION ================= */
                    const subRes =
                        Object.keys(subPayload).length > 0 && editSubscriptionData?.id
                            ? await editSubscription(editSubscriptionData.id, subPayload)
                            : true;
                    return {
                        success: !!(orgRes && subRes),
                        message: orgRes && subRes
                            ? 'Organization berhasil diperbarui!'
                            : 'Gagal update organization'
                    };
                } catch {
                    alert.error('Terjadi kesalahan saat memperbarui data.');
                    return {
                        success: false,
                        message: 'Terjadi kesalahan.'
                    };
                }

            }
        );
        /* ================= RESET STATE ================= */
        setEditFormData(null);
        setEditSubscriptionData({});
        setInitialData(null);
        setInitialSubscriptionData(null);
        setIsEditModalOpen(false);
    };

    const handleOpenEdit = (org: IOrganization) => {
        const mappedOrg: IUpdateOrganization = {
            id: org.id,
            name: org.name,
            slug: org.slug,
        };
        setEditFormData(mappedOrg);
        setInitialData(mappedOrg);
        if (org.subscription) {
            const mappedSub: IUpdateSubscription = {
                id: org.subscription.id,
                plan_id: org.subscription.plan_id,
                start_date: org.subscription.start_date,
                end_date: org.subscription.end_date,
                status: org.subscription.status,
            };

            setEditSubscriptionData(mappedSub);
            setInitialSubscriptionData(mappedSub);
        }
        setIsEditModalOpen(true);
    };

    //=====================================================================

    const tableData = useMemo(() => {
        let data = organizations;
        const q = search.trim().toLowerCase();
        if (q) {
            data = data.filter((f) => `${f.name}`.toLowerCase().includes(q));
        }
        return data;
    }, [organizations, search]);

    const columns = useMemo<ColumnDef<IOrganization>[]>(() => [
        {
            header: 'No',
            cell: ({ row }) => row.index + 1,
            size: 50
        },
        {
            header: 'Organization Name',
            accessorKey: 'name',
            size: 250
        },
        {
            header: 'Slug',
            accessorKey: 'slug',
            size: 200
        },
        {
            header: 'Plan',
            accessorKey: 'subscription.plan.name',
            size: 150
        },
        {
            header: 'Status',
            accessorKey: 'subscription.status',
            size: 120,
            cell: ({ row }) => {
                const active = row.original.subscription?.status;

                return (
                    <Badge variant={active ? 'success' : 'error'}>
                        {active ? 'Active' : 'Inactive'}
                    </Badge>
                );
            },
        },
        {
            header: 'Aksi',
            id: 'actions',
            size: 120,
            cell: ({ row }) => {
                return (
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
                                handleDelete(row.original.id ?? '', row.original.name ?? '');
                            }}
                        >
                            <IconTrash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            }
        },
    ], []);
    if (organizationsLoading) return <Loader />;
    if (organizationsError) return <ErrorFallback />;

    return (
        <div>
            <h2 className="mb-4 text-lg font-semibold">Daftar Organizations</h2>
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="w-full max-w-[320px]">
                    <InputSearch placeholder="name..." value={search}
                        onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setIsAddModalOpen(true)}>
                        <IconPlus className="h-4 w-4" /> Tambah Organization
                    </Button>
                </div>
            </div>
            <DataTable columns={columns} data={tableData} filterField="name" isRemovePagination={false}
                rowProps={row => ({
                    onClick: () => router.push(`organization/${encodeId(row.original.id)}`),
                    className: 'cursor-pointer transition-colors hover:bg-black/[0.02] active:bg-black/[0.03]',
                })}
            />
            <Modal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddSubmit}
                title="Tambah Organization"
            >
                <AddOrganizationForm
                    formData={addFormData ?? undefined}
                    subscriptionData={subscriptionFormData}
                    onChange={(org, sub) => {
                        setAddFormData(org as ICreateOrganization);
                        setSubscriptionFormData(sub);
                    }}
                />
            </Modal>
            <Modal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                title="Edit Feature"
            >
                {editFormData && (
                    <EditOrganizationForm
                        organizationData={editFormData}
                        subscriptionData={editSubscriptionData}
                        onChange={(org, sub) => {
                            setEditFormData(org as IUpdateOrganization);
                            setEditSubscriptionData(sub);
                        }}
                    />
                )}
            </Modal>
        </div>
    );
}
