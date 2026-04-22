'use client';
import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/custom/table/data-table';
import { IconPencil, IconTrash, IconPlus } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { useGetAllUsers } from '@/hooks/users';
import { IUser, ICreateUser, IUpdateUser } from '@/types/user';
import { InputSearch } from '@/components/ui/input-search';
import Modal from '@/components/ui/modal-form';
import ErrorFallback from '@/components/fallback/ErrorFallback';
import Loader from '@/components/fallback/Loader';

import { createUser, editUser, deleteUser } from '@/hooks/users';
import AddUserForm from '../form/AddUser';
import EditUserForm from '../form/EditUser';
import { useAlert } from '@/components/alert/alert-dialog-global';

export default function AdminSection() {
  const router = useRouter();
  const alert = useAlert();
  const { users, usersLoading, usersError } = useGetAllUsers();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState<ICreateUser | null>(null);
  const [editFormData, setEditFormData] = useState<IUpdateUser | null>(null);
  const [initialData, setInitialData] = useState<IUpdateUser | null>(null);

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

  //=====================HANDLE=========================//
  const handleAddSubmit = async () => {
    if (!addFormData?.email || !addFormData?.password)
      return alert.error('Email dan Password wajib diisi!');
    await alert.confirmAsync('Yakin ingin menambahkan user ini?', async () => {
      const payload: ICreateUser = { ...addFormData };
      const res = await createUser(payload);
      return res
        ? { success: true }
        : { success: false, message: 'Tidak ada response dari server.' };
    });
    // kalau sukses, reset form
    setAddFormData(null);
    setIsAddModalOpen(false);
    localStorage.removeItem('add_user_form');
  };

  const handleEditSubmit = async () => {
    if (!editFormData?.email) return alert.error('Email wajib diisi!');
    if (!initialData) return alert.error('Data awal tidak tersedia.');
    await alert.confirmAsync(
      'Yakin ingin menyimpan perubahan user ini?',
      async () => {
        const changedOnly = getChangedFields(editFormData, initialData);
        const payload: Partial<IUpdateUser> = cleanPayload(changedOnly);
        if (Object.keys(payload).length === 0) {
          alert.info('Tidak ada perubahan data.');
          return { success: false, message: 'Tidak ada perubahan' };
        }
        const res = await editUser(editFormData.id!, payload);
        // ubah return editUser jadi object {success, message}
        return {
          success: !!res,
          message: res ? 'User berhasil diperbarui!' : 'Gagal update user',
        };
      }
    );
    setEditFormData(null);
    setInitialData(null);
    setIsEditModalOpen(false);
  };

  const handleOpenEdit = useCallback((user: IUser) => {
    const mapped: IUpdateUser = { id: user.id, email: user.email };
    setEditFormData(mapped);
    setInitialData(mapped);
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string, email: string) => {
      await alert.confirmAsync(
        `Yakin ingin menghapus "${email}"?`,
        async () => {
          return await deleteUser(id);
        }
      );
    },
    [alert]
  );

  //=====================================================================

  const tableData = useMemo(() => {
    let data = users;
    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter((u) => `${u.email}`.toLowerCase().includes(q));
    }

    return data;
  }, [users, search]);

  const columns = useMemo<ColumnDef<IUser>[]>(
    () => [
      { header: 'No', cell: ({ row }) => row.index + 1 },
      { header: 'Email', accessorKey: 'email' },
      {
        header: 'Status',
        accessorKey: 'is_active',
        cell: ({ getValue }) =>
          getValue<boolean>() ? (
            <span className="text-green-600 font-medium">Active</span>
          ) : (
            <span className="text-red-500 font-medium">Inactive</span>
          ),
      },
      {
        header: 'Aksi',
        id: 'actions',
        cell: ({ row }) => {
          return (
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
                  handleDelete(row.original.id, row.original.email);
                }}
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [handleDelete, handleOpenEdit]
  );
  if (usersLoading)
    return (
      <div className="p-4 text-center">
        <Loader />
      </div>
    );
  if (usersError)
    return (
      <div className="p-4 text-center text-red-500">
        <ErrorFallback />
      </div>
    );

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Daftar Users</h2>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="w-full max-w-[320px]">
          <InputSearch
            placeholder="email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <IconPlus className="h-4 w-4" /> Tambah Users
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={tableData}
        filterField="email"
        isRemovePagination={false}
        rowProps={(row) => ({
          onClick: () => router.push(`/admin/users/${row.original.id}`),
          className:
            'cursor-pointer transition-colors hover:bg-black/[0.02] active:bg-black/[0.03]',
        })}
      />
      <Modal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        title="Tambah User"
      >
        <AddUserForm
          formData={addFormData ?? undefined}
          onChange={(data) =>
            setAddFormData((prev) =>
              JSON.stringify(prev) !== JSON.stringify(data)
                ? (data as ICreateUser)
                : prev
            )
          }
        />
      </Modal>
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        title="Edit User"
      >
        {editFormData && (
          <EditUserForm
            key={editFormData.id}
            formData={editFormData}
            onChange={(data: IUpdateUser) =>
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
