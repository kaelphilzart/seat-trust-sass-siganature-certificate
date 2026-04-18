'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/custom/table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { IconPencil, IconTrash, IconUserPlus, IconDownload, IconLoader2, IconChevronRight } from '@tabler/icons-react';
import ErrorFallback from '@/components/fallback/ErrorFallback';
import Loader from '@/components/fallback/Loader';
import { useAlert } from '@/components/alert/alert-dialog-global';
import { formatDateLong } from '@/utils/datetime';

import { useGetOneBatch } from '@/hooks/batch';
import { useGetAllParticipants } from '@/hooks/participant';
import { useGetAllBatchRepresentatives } from '@/hooks/batch-representative';
import { downloadCertificate, downloadCertificateParticipant } from '@/hooks/certificate';

import { IParticipant } from '@/types/participant';
import { IBatchRepresentative } from '@/types/batch-representative';
import { paths } from '@/routes/paths';
import { encodeId } from '@/utils/encode';

export interface Props {
    batchId: string;
}

export default function AdminDynamicSection({ batchId }: Props) {
    const router = useRouter();
    const alert = useAlert();

    const { batchOne, batchOneLoading, batchOneError } = useGetOneBatch(batchId);
    const { participants, participantsLoading, participantsError } = useGetAllParticipants(batchId);
    const { batchRepresentatives, batchRepresentativesLoading, batchRepresentativesError } = useGetAllBatchRepresentatives(batchId);


    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingParticipant, setLoadingParticipant] = useState(false);
    const hasMoreParticipant = participants?.length > 5;
    //=====================================================================

    const tableDataParticipant = useMemo(() => {
        let data = participants;
        const q = search.trim().toLowerCase();
        if (q) {
            data = data.filter((f) => `${f.name}`.toLowerCase().includes(q));
        }
        return data.slice(0, 5);
    }, [participants, search]);

    const tableDataRepresentatives = useMemo(() => {
        let data = batchRepresentatives;
        return data;
    }, [batchRepresentatives]);

    const columnsParticipant = useMemo<ColumnDef<IParticipant>[]>(() => [
        {
            header: 'No',
            cell: ({ row }) => row.index + 1,
            size: 2,
        },
        {
            header: 'Name',
            accessorKey: 'name',
            size: 3,
        },
        {
            header: 'Email',
            accessorKey: 'email',
            size: 3,
        },

        // =========================
        // ACTION COLUMN
        // =========================
        {
            header: 'Action',
            cell: ({ row }) => {
                const participant = row.original;

                return (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownloadParticipant(participant.id)}
                        disabled={loadingParticipant || !batchOne?.id}
                    >
                        {loadingParticipant ? <IconLoader2 className='w-4 h-4' /> : <IconDownload className='w-4 h-4' />}
                        {loadingParticipant ? 'Downloading...' : 'Certificate'}
                    </Button>
                );
            },
        },
    ], [loadingParticipant, batchOne]);

    const columnsRepresentatives = useMemo<ColumnDef<IBatchRepresentative>[]>(() => [
        { header: 'No', cell: ({ row }) => row.index + 1, size: 2 },
        { header: 'Name', accessorKey: 'representative.name', size: 3 },
        { header: 'Title', accessorKey: 'representative.title', size: 3 },

    ], []);



    //=====================HANDLE=========================//
    const handleDownload = async () => {
        setLoading(true);
        try {
            await downloadCertificate(batchOne?.id ?? '');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadParticipant = async (participantId: string) => {
        if (!batchOne?.id || !participantId) return;

        setLoadingParticipant(true);

        try {
            await downloadCertificateParticipant(batchOne.id, participantId);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingParticipant(false);
        }
    };
    // const handleAddSubmit = async () => {
    //     if (!addFormData?.role)
    //         return alert.error('Role wajib diisi!');

    //     if (!userData?.email || !userData?.password)
    //         return alert.error('Email and Password wajib diisi!');

    //     await alert.confirmAsync('Yakin ingin menambahkan organization user ini?', async () => {

    //         const ouPayload: ICreateOrganizationUser = {
    //             ...addFormData,
    //             organization_id: organizationId,
    //         };

    //         const userPayload: ICreateUser = {
    //             email: userData.email,
    //             password: userData.password,
    //         };
    //         const res = await createOrganizationUser(organizationId, userPayload, ouPayload);

    //         if (res) {
    //             setAddFormData(null);
    //             setUserData(null);
    //             setIsAddModalOpen(false);
    //         }

    //         return res
    //             ? { success: true }
    //             : { success: false, message: 'Tidak ada response dari server.' };
    //     });
    // };

    // const handleEditSubmit = async () => {
    //     if (!editFormData?.role)
    //         return alert.error("role wajib diisi!");

    //     if (!initialData)
    //         return alert.error("Data awal tidak tersedia.");

    //     await alert.confirmAsync(
    //         "Yakin ingin menyimpan perubahan organization ini?",
    //         async () => {

    //             /* ================= CEK PERUBAHAN ================= */

    //             const changedFields = getChangedFields(editFormData, initialData);
    //             const payload: Partial<IUpdateOrganizationUser> = cleanPayload(changedFields);

    //             if (Object.keys(payload).length === 0) {
    //                 alert.info("Tidak ada perubahan data.");
    //                 return { success: false };
    //             }

    //             try {

    //                 const res = await editOrganizationUser(
    //                     editFormData.id!,
    //                     payload
    //                 );

    //                 return {
    //                     success: !!res,
    //                     message: res
    //                         ? "Organization user berhasil diperbarui!"
    //                         : "Gagal update organization user",
    //                 };

    //             } catch {
    //                 alert.error("Terjadi kesalahan saat memperbarui data.");

    //                 return {
    //                     success: false,
    //                     message: "Terjadi kesalahan.",
    //                 };
    //             }
    //         }
    //     );

    //     /* ================= RESET STATE ================= */

    //     setEditFormData(null);
    //     setInitialData(null);
    //     setIsEditModalOpen(false);
    // };

    // const handleOpenEdit = (org: IOrganizationUser) => {

    //     const mapped: IUpdateOrganizationUser = {
    //         id: org.id,
    //         role: org.role,
    //         email: org.user?.email ?? "",
    //     };
    //     setEditFormData(mapped);
    //     setInitialData(mapped);

    //     setIsEditModalOpen(true);
    // };


    // const handleDelete = async (id: string, email: string) => {
    //     await alert.confirmAsync(`Yakin ingin menghapus "${email}"?`, async () => {
    //         return await deleteOrganizationUser(id);
    //     });
    // };

    //PLAN 

    if (batchOneLoading || participantsLoading || batchRepresentativesLoading) return <div className="p-4 text-center"><Loader /></div>;
    if (batchOneError || participantsError || batchRepresentativesError) return <div className="p-4 text-center text-red-500"><ErrorFallback /></div>;




    return (
        <div className="p-4 space-y-6">
            {/* Header Plan */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="mb-4"
            >
                ← Kembali
            </Button>
            <Card className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                {/* Left Info */}
                <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-semibold">
                        {batchOne?.name}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="lightPrimary">
                            {batchOne?.status ?? '-'}
                        </Badge>
                    </div>
                    <div className="text-sm">
                        <span className="font-medium">Active :</span>{' '}
                        {formatDateLong(batchOne?.start_date)} -{' '}
                        {formatDateLong(batchOne?.end_date)}
                    </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-2">
                    {batchOne?.template?.file_path ? (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleDownload}
                            disabled={loading || !batchOne?.id}
                        >
                            {loading ? 'Downloading...' : 'Download Certificate'}
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="default"
                        // onClick={() => setIsUploadModalOpen(true)}
                        >
                            <IconUserPlus className="h-4 w-4 mr-1" />
                            Upload Template
                        </Button>
                    )}
                </div>

            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feature  Table */}
                <Card>
                    <div className='flex justify-between'>
                        <h3 className="text-xl font-semibold mb-4">Participant</h3>
                        <Link href={`${paths.participant.create}/${encodeId(batchId)}`}>
                            <Button
                                size="sm"
                                variant="secondary"
                            >
                                <IconUserPlus className="h-4 w-4 mr-1" />
                                Participant
                            </Button>
                        </Link>
                    </div>
                    <DataTable columns={columnsParticipant} data={tableDataParticipant} filterField="name" isRemovePagination={true}
                    />
                    {hasMoreParticipant && (
                        <div className="flex justify-end mt-3">
                            <Link href="/participants">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1 text-primary"
                                >
                                    View All
                                    <IconChevronRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    )}
                </Card>
                {/* Organization Users Table */}
                <Card>

                    <div className='flex justify-between'>
                        <h3 className="text-xl font-semibold mb-4">Representative</h3>
                        <Link href={`${paths.batch.create}?batch_id=${encodeId(batchId)}`}>
                            <Button
                                size="sm"
                                variant="secondary"
                            >
                                <IconUserPlus className="h-4 w-4 mr-1" />
                                Representative
                            </Button>
                        </Link>
                    </div>
                    <DataTable columns={columnsRepresentatives} data={tableDataRepresentatives} filterField="name" isRemovePagination={true}
                    />
                </Card>
            </div>
            {/* <Modal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddSubmit}
                title="Tambah Organization User"
            >
                <AddOrganizationUserForm
                    organizationUserData={addFormData ?? undefined}
                    userData={userData ?? undefined}
                    onChange={(ou, u) => {
                        setAddFormData(ou as ICreateOrganizationUser);
                        setUserData(u as ICreateUser);
                    }}
                />
            </Modal>
            <Modal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                title="Edit Organization user"
            >
                {editFormData && (
                    <EditOrganizationUserForm
                        data={editFormData}
                        onChange={(data) => {
                            setEditFormData(data as IUpdateOrganizationUser);
                        }}
                    />
                )}
            </Modal> */}
        </div>
    );
}