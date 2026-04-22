'use client';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/custom/table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { IconPencil, IconTrash, IconUserPlus } from '@tabler/icons-react';
import ErrorFallback from '@/components/fallback/ErrorFallback';
import Loader from '@/components/fallback/Loader';
import { useAlert } from '@/components/alert/alert-dialog-global';
import { formatDateLong } from '@/utils/datetime';
import Modal from '@/components/ui/modal-form';

import { useGetOneOrganization } from '@/hooks/organizations';
import { IPlanFeatureValue } from '@/types/plan-feature-value';
import { useGetAllPlanFeatureValue } from '@/hooks/plan-feature-value';
import {
  useGetAllOrganizationUsers,
  createOrganizationUser,
  editOrganizationUser,
  deleteOrganizationUser,
} from '@/hooks/organization-user';
import {
  ICreateOrganizationUser,
  IOrganizationUser,
  IUpdateOrganizationUser,
} from '@/types/organization-user';
import { ICreateUser } from '@/types/user';

import AddOrganizationUserForm from '../form/AddOrganizationUser';
import EditOrganizationUserForm from '../form/EditOrganizationuser';

export interface Props {
  organizationId: string;
}

export default function OrganizationDynamic({ organizationId }: Props) {
  const router = useRouter();
  const alert = useAlert();
  const { organizationOne, organizationOneLoading, organizationOneError } =
    useGetOneOrganization(organizationId);
  const {
    organizationUsers,
    organizationUsersLoading,
    organizationUsersError,
  } = useGetAllOrganizationUsers(organizationId);
  const planId = organizationOne?.subscription?.plan_id;
  const {
    planFeatureValues,
    planFeatureValuesLoading,
    planFeatureValuesError,
  } = useGetAllPlanFeatureValue(planId);
  const [search] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] =
    useState<ICreateOrganizationUser | null>(null);
  const [userData, setUserData] = useState<ICreateUser | null>(null);

  //edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] =
    useState<IUpdateOrganizationUser | null>(null);
  const [initialData, setInitialData] =
    useState<IUpdateOrganizationUser | null>(null);

  const getChangedFields = <T extends object>(newData: T, oldData: T) => {
    const changed: Partial<T> = {};
    for (const key in newData)
      if (newData[key] !== oldData[key]) changed[key] = newData[key];
    return changed;
  };

  const cleanPayload = (obj: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(obj).filter(
        ([, v]) => v !== '' && v !== null && v !== undefined
      )
    );

  //=====================================================================
  //=====================HANDLE=========================//
  const handleAddSubmit = async () => {
    if (!addFormData?.role) return alert.error('Role wajib diisi!');

    if (!userData?.email || !userData?.password)
      return alert.error('Email and Password wajib diisi!');

    await alert.confirmAsync(
      'Yakin ingin menambahkan organization user ini?',
      async () => {
        const ouPayload: ICreateOrganizationUser = {
          ...addFormData,
          organization_id: organizationId,
        };

        const userPayload: ICreateUser = {
          email: userData.email,
          password: userData.password,
        };
        const res = await createOrganizationUser(
          organizationId,
          userPayload,
          ouPayload
        );

        if (res) {
          setAddFormData(null);
          setUserData(null);
          setIsAddModalOpen(false);
        }

        return res
          ? { success: true }
          : { success: false, message: 'Tidak ada response dari server.' };
      }
    );
  };

  const handleEditSubmit = async () => {
    if (!editFormData?.role) return alert.error('role wajib diisi!');

    if (!initialData) return alert.error('Data awal tidak tersedia.');

    await alert.confirmAsync(
      'Yakin ingin menyimpan perubahan organization ini?',
      async () => {
        /* ================= CEK PERUBAHAN ================= */

        const changedFields = getChangedFields(editFormData, initialData);
        const payload: Partial<IUpdateOrganizationUser> =
          cleanPayload(changedFields);

        if (Object.keys(payload).length === 0) {
          alert.info('Tidak ada perubahan data.');
          return { success: false };
        }

        try {
          const res = await editOrganizationUser(editFormData.id!, payload);

          return {
            success: !!res,
            message: res
              ? 'Organization user berhasil diperbarui!'
              : 'Gagal update organization user',
          };
        } catch {
          alert.error('Terjadi kesalahan saat memperbarui data.');

          return {
            success: false,
            message: 'Terjadi kesalahan.',
          };
        }
      }
    );

    /* ================= RESET STATE ================= */

    setEditFormData(null);
    setInitialData(null);
    setIsEditModalOpen(false);
  };

  const handleOpenEdit = useCallback((org: IOrganizationUser) => {
    const mapped: IUpdateOrganizationUser = {
      id: org.id,
      role: org.role,
      email: org.user?.email ?? '',
    };
    setEditFormData(mapped);
    setInitialData(mapped);

    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string, email: string) => {
      await alert.confirmAsync(
        `Yakin ingin menghapus "${email}"?`,
        async () => {
          return await deleteOrganizationUser(id);
        }
      );
    },
    [alert]
  );

  const tableData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return planFeatureValues;
    return planFeatureValues.filter((f) =>
      String(f.feature).toLowerCase().includes(q)
    );
  }, [planFeatureValues, search]);

  const tableDataUser = useMemo(() => organizationUsers, [organizationUsers]);

  const columns = useMemo<ColumnDef<IPlanFeatureValue>[]>(
    () => [
      { header: 'No', cell: ({ row }) => row.index + 1, size: 2 },
      { header: 'Fitur ', accessorKey: 'feature.display_name', size: 3 },
      { header: 'Value', accessorKey: 'value' },
    ],
    []
  );

  const columnsUser = useMemo<ColumnDef<IOrganizationUser>[]>(
    () => [
      { header: 'No', cell: ({ row }) => row.index + 1, size: 2 },
      { header: 'Role', accessorKey: 'role', size: 2 },
      { header: 'Email', accessorKey: 'user.email', size: 2 },
      {
        header: 'Aksi',
        id: 'actions',
        size: 120,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(row.original);
              }}
            >
              <IconPencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(
                  row.original.id ?? '',
                  row.original.user?.email ?? ''
                );
              }}
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleDelete, handleOpenEdit]
  );

  //PLAN

  if (
    organizationOneLoading ||
    planFeatureValuesLoading ||
    organizationUsersLoading
  )
    return (
      <div className="p-4 text-center">
        <Loader />
      </div>
    );
  if (organizationOneError || planFeatureValuesError || organizationUsersError)
    return (
      <div className="p-4 text-center text-red-500">
        <ErrorFallback />
      </div>
    );

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
            {organizationOne?.name}
          </h2>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Slug: {organizationOne?.slug}</span>

            {organizationOne?.subscription?.plan?.name && (
              <Badge variant="lightPrimary">
                {organizationOne.subscription.plan.name.toUpperCase()}
              </Badge>
            )}
          </div>
          <div className="text-sm">
            <span className="font-medium">Active :</span>{' '}
            {formatDateLong(organizationOne?.subscription?.start_date)} -{' '}
            {formatDateLong(organizationOne?.subscription?.end_date)}
          </div>
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <IconUserPlus className="h-4 w-4 mr-1" />
            Tambah User
          </Button>
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature  Table */}
        <Card>
          <h3 className="text-xl font-semibold mb-4">Fitur - fitur</h3>
          <DataTable
            columns={columns}
            data={tableData}
            filterField="feature_key"
            isRemovePagination={true}
          />
        </Card>
        {/* Organization Users Table */}
        <Card>
          <h3 className="text-xl font-semibold mb-4">Organization Users</h3>
          <DataTable
            columns={columnsUser}
            data={tableDataUser}
            filterField="organization.role"
            isRemovePagination={true}
          />
        </Card>
      </div>
      <Modal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        title="Tambah Organization User"
      >
        <AddOrganizationUserForm
          organizationUserData={addFormData ?? undefined}
          userData={userData ?? undefined}
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
            key={editFormData.id}
            data={editFormData}
            onChange={(data) => {
              setEditFormData(data as IUpdateOrganizationUser);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
