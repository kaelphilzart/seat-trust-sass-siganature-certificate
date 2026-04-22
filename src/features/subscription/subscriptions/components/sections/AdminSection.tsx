'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/custom/table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { ISubscription } from '@/types/subscription';
import { InputSearch } from '@/components/ui/input-search';
import ErrorFallback from '@/components/fallback/ErrorFallback';
import Loader from '@/components/fallback/Loader';
import { encodeId } from '@/utils/encode';
import { useGetAllSubscriptions } from '@/hooks/subscription';
import { paths } from '@/routes/paths';
import { formatDateLong } from '@/utils/datetime';

export default function AdminSection() {
  const router = useRouter();
  const { subscriptions, subscriptionsLoading, subscriptionsError } =
    useGetAllSubscriptions();
  const [search, setSearch] = useState('');

  //=====================================================================

  const tableData = useMemo(() => {
    let data = subscriptions;
    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter((u) =>
        `${u.organization?.name}`.toLowerCase().includes(q)
      );
    }

    return data;
  }, [subscriptions, search]);

  const columns = useMemo<ColumnDef<ISubscription>[]>(
    () => [
      {
        header: 'No',
        cell: ({ row }) => row.index + 1,
      },
      {
        header: 'Organization',
        accessorFn: (row) => row.organization?.name,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">
              {row.original.organization?.name}
            </span>
            <Badge variant="default" className="w-fit text-[10px] px-2 py-0">
              {row.original.organization?.slug}
            </Badge>
          </div>
        ),
      },
      { header: 'Plan', accessorKey: 'plan.name' },
      {
        header: 'Status',
        accessorKey: 'status',
        size: 120,
        cell: ({ row }) => {
          const active = row.original.status;

          return (
            <Badge variant={active ? 'success' : 'error'}>
              {active ? 'Active' : 'Inactive'}
            </Badge>
          );
        },
      },
      {
        header: 'Berakhir',
        accessorKey: 'end_date',
        cell: ({ getValue }) => formatDateLong(getValue<string>()),
      },
    ],
    []
  );
  if (subscriptionsLoading)
    return (
      <div className="p-4 text-center">
        <Loader />
      </div>
    );
  if (subscriptionsError)
    return (
      <div className="p-4 text-center text-red-500">
        <ErrorFallback />
      </div>
    );

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Daftar Susbcription</h2>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="w-full max-w-[320px]">
          <InputSearch
            placeholder="email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={tableData}
        filterField="email"
        isRemovePagination={false}
        rowProps={(row) => ({
          onClick: () =>
            router.push(
              `${paths.organization.base}/${encodeId(row.original.organization.id)}`
            ),
          className:
            'cursor-pointer transition-colors hover:bg-black/[0.02] active:bg-black/[0.03]',
        })}
      />
    </div>
  );
}
