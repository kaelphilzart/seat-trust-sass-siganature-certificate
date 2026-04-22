'use client';
import { useCallback, useMemo, useState } from 'react';
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
import { useSession } from 'next-auth/react';
import AddOrganizationAssetForm from '../form/AddOrganizationAsset';
import EditOrganizationAssetForm from '../form/EditOrganizationAsset';

import {
  useGetAllOrganizationAssets,
  createOrganizationAsset,
  editOrganizationAsset,
  deleteOrganizationAsset,
} from '@/hooks/organization-asset';
import {
  ICreateOrganizationAsset,
  IOrganizationAsset,
  IUpdateOrganizationAsset,
} from '@/types/organization';
import { Badge } from '@/components/ui/badge';

export default function AdminSection() {
  const alert = useAlert();

  const { data: session } = useSession();

  const organizationId = session?.user?.organization_id;
  const {
    OrganizationAssets,
    OrganizationAssetsError,
    OrganizationAssetsLoading,
  } = useGetAllOrganizationAssets(organizationId);

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] =
    useState<ICreateOrganizationAsset | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] =
    useState<IUpdateOrganizationAsset | null>(null);
  const [initialData, setInitialData] =
    useState<IUpdateOrganizationAsset | null>(null);

  const getChangedFields = <T extends object>(newData: T, oldData: T) => {
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

  const cleanPayload = (obj: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(obj).filter(
        ([, v]) => v !== undefined && v !== null && v !== ''
      )
    );

  //=====================HANDLE=========================//
  const handleDelete = useCallback(
    async (id: string, name: string) => {
      await alert.confirmAsync(`Yakin ingin menghapus "${name}"?`, async () => {
        return await deleteOrganizationAsset(id);
      });
    },
    [alert]
  );

  const handleAddSubmit = async () => {
    if (!addFormData?.name || !addFormData?.file)
      return alert.error('Name dan File wajib diisi!');

    await alert.confirmAsync('Yakin ingin menambahkan asset ini?', async () => {
      const payload: ICreateOrganizationAsset & { file: File } = {
        ...addFormData,
        file: addFormData.file!,
      };

      const res = await createOrganizationAsset(payload);

      if (res.success) {
        // ✅ pindahin ke sini
        setAddFormData(null);
        setIsAddModalOpen(false);
        localStorage.removeItem('add_organization_asset_form');
      }

      return {
        success: res.success,
        message: res.message || 'Tidak ada response dari server.',
      };
    });
  };

  const handleEditSubmit = async () => {
    if (!editFormData?.id) return alert.error('Data tidak lengkap!');
    if (!initialData) return alert.error('Data awal tidak tersedia.');

    await alert.confirmAsync('Yakin ingin menyimpan perubahan?', async () => {
      const changedOnly = getChangedFields(editFormData, initialData);
      const payload: Partial<IUpdateOrganizationAsset> =
        cleanPayload(changedOnly);

      if (Object.keys(payload).length === 0) {
        alert.info('Tidak ada perubahan data.');
        return { success: false, message: 'Tidak ada perubahan' };
      }

      const res = await editOrganizationAsset(editFormData.id!, payload);
      return { success: res.success, message: res.message };
    });

    setEditFormData(null);
    setInitialData(null);
    setIsEditModalOpen(false);
  };

  const handleOpenEdit = useCallback((element: IOrganizationAsset) => {
    const mapped: IUpdateOrganizationAsset = {
      id: element.id,
      name: element.name,
      organization_id: element.organization?.id,
      type: element.type,
      file_path: element.file_path,
    };
    setEditFormData(mapped);
    setInitialData(mapped);
    setIsEditModalOpen(true);
  }, []);

  //=====================================================================
  const tableData = useMemo(() => {
    let data = OrganizationAssets;
    const q = search.trim().toLowerCase();
    if (q) data = data.filter((f) => `${f.name}`.toLowerCase().includes(q));
    return data;
  }, [OrganizationAssets, search]);

  const columns = useMemo<ColumnDef<IOrganizationAsset>[]>(
    () => [
      { header: 'No', cell: ({ row }) => row.index + 1, size: 50 },
      { header: 'Name', accessorKey: 'name', size: 250 },
      { header: 'Tipe', accessorKey: 'type', size: 200 },
      {
        header: 'File',
        accessorKey: 'file_path',
        size: 150,
        cell: ({ row }) => {
          const url = row.original.file_path;
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
        },
      },
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
                handleDelete(row.original.id!, row.original.name!);
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

  if (OrganizationAssetsLoading) return <Loader />;
  if (OrganizationAssetsError) return <ErrorFallback />;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Daftar Aset</h2>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="w-full max-w-[320px]">
          <InputSearch
            placeholder="Search by name..."
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
            <IconPlus className="h-4 w-4" /> Tambah Aset
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={tableData}
        filterField="name"
        isRemovePagination={false}
      />

      <Modal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        title="Tambah Aset"
      >
        <AddOrganizationAssetForm
          formData={addFormData ?? undefined}
          onChange={(data) =>
            setAddFormData((prev) =>
              JSON.stringify(prev) !== JSON.stringify(data)
                ? (data as ICreateOrganizationAsset)
                : prev
            )
          }
        />
      </Modal>

      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        title="Edit Aset"
      >
        {editFormData && (
          <EditOrganizationAssetForm
            key={editFormData.id}
            formData={editFormData}
            onChange={(data: IUpdateOrganizationAsset) =>
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
