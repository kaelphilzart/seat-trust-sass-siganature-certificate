'use client';
import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/custom/table/data-table';
import { IconPlus, IconPencil } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/react-table';
import { useAlert } from '@/components/alert/alert-dialog-global';
import ErrorFallback from '@/components/fallback/ErrorFallback';
import Loader from '@/components/fallback/Loader';
import { InputSearch } from '@/components/ui/input-search';
import { formatDateLong } from '@/utils/datetime';
import { IconTrash } from '@tabler/icons-react';
import Modal from '@/components/ui/modal-form';

import { useGetAllBatch, deleteBatch, editBatch } from '@/hooks/batch';
import { IBatch, IUpdateBatch } from '@/types/batch';
import { encodeId } from '@/utils/encode';
import { paths } from '@/routes/paths';

import EditbatchForm from '../forms/EditBatchForm';

export default function AdminSection() {
  const router = useRouter();
  const alert = useAlert();
  const { data: session } = useSession();

  const organizationId = session?.user?.organization_id;

  const { Batches, BatchesError, BatchesLoading } =
    useGetAllBatch(organizationId);
  const [search, setSearch] = useState('');

  //==================================================
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<IUpdateBatch | null>(null);
  const [initialData, setInitialData] = useState<IUpdateBatch | null>(null);

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
  const handleEditSubmit = async () => {
    if (
      !editFormData?.name ||
      !editFormData?.start_date ||
      !editFormData.end_date
    )
      return alert.error('field tidak boleh dikosongkan!');

    if (!initialData) return alert.error('Data awal tidak tersedia.');

    await alert.confirmAsync(
      'Yakin ingin menyimpan perubahan ini?',
      async () => {
        /* ================= CEK PERUBAHAN ================= */

        const changedFields = getChangedFields(editFormData, initialData);
        const payload: Partial<IUpdateBatch> = cleanPayload(changedFields);

        if (Object.keys(payload).length === 0) {
          alert.info('Tidak ada perubahan data.');
          return { success: false };
        }
        try {
          const res = await editBatch(editFormData.id!, payload);
          return {
            success: !!res,
            message: res ? 'Event berhasil diperbarui!' : 'Gagal update ',
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

  const handleOpenEdit = useCallback((b: IBatch) => {
    const mapped: IUpdateBatch = {
      id: b.id,
      name: b.name,
      start_date: b.start_date,
      end_date: b.end_date,
    };
    setEditFormData(mapped);
    setInitialData(mapped);

    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      await alert.confirmAsync(`Yakin ingin menghapus "${name}"?`, async () => {
        return await deleteBatch(id);
      });
    },
    [alert]
  );
  //=====================================================================

  const tableData = useMemo(() => {
    let data = Batches;
    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter((f) => `${f.name}`.toLowerCase().includes(q));
    }
    return data;
  }, [Batches, search]);

  const columns = useMemo<ColumnDef<IBatch>[]>(
    () => [
      {
        header: 'No',
        cell: ({ row }) => row.index + 1,
        size: 50,
      },
      {
        header: 'Event Name',
        accessorKey: 'name',
        size: 200,
      },
      {
        header: 'Organization',
        accessorFn: (row) => row.organization?.name || '-',
        size: 200,
      },
      {
        header: 'Tanggal',
        accessorFn: (row) =>
          `${formatDateLong(row.start_date)} - ${formatDateLong(row.end_date)}`,
        size: 200,
      },
      {
        header: 'Participants',
        accessorKey: 'participants_count', // pastikan ada di type
        cell: ({ getValue }) => (
          <span className="font-semibold">{getValue<number>() || 0}</span>
        ),
        size: 120,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const status = getValue<string>();

          const colorMap: Record<string, string> = {
            DRAFT: 'bg-gray-100 text-gray-700',
            ACTIVE: 'bg-green-100 text-green-700',
            DONE: 'bg-blue-100 text-blue-700',
          };

          return (
            <span
              className={`px-2 py-1 text-xs rounded ${
                colorMap[status] || 'bg-gray-100'
              }`}
            >
              {status}
            </span>
          );
        },
        size: 120,
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
                  handleDelete(row.original.id ?? '', row.original.name ?? '');
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
  if (BatchesLoading) return <Loader />;
  if (BatchesError) return <ErrorFallback />;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Daftar Event</h2>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="w-full max-w-[320px]">
          <InputSearch
            placeholder="name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Link href={paths.batch.create}>
            <Button size="sm" variant="secondary">
              <IconPlus className="h-4 w-4" /> Tambah Batch
            </Button>
          </Link>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={tableData}
        filterField="name"
        isRemovePagination={false}
        rowProps={(row) => ({
          onClick: () =>
            router.push(`${paths.batch.base}/${encodeId(row.original.id)}`),
          className:
            'cursor-pointer transition-colors hover:bg-black/[0.02] active:bg-black/[0.03]',
        })}
      />

      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        title="Edit Event"
      >
        {editFormData && (
          <EditbatchForm
            formData={editFormData}
            onChange={(data) => {
              setEditFormData(data as IUpdateBatch);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
