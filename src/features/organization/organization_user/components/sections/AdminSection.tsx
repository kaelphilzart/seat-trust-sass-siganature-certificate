'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/custom/table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { IOrganizationUser } from '@/types/organization-user';
import { InputSearch } from '@/components/ui/input-search';
import ErrorFallback from '@/components/fallback/ErrorFallback';
import Loader from '@/components/fallback/Loader';
import { encodeId } from '@/utils/encode';
import { useGetAllOrganizationUsers } from '@/hooks/organization-user';
import { paths } from '@/routes/paths';

export default function AdminSection() {
  const router = useRouter();
  const {
    organizationUsers,
    organizationUsersLoading,
    organizationUsersError,
  } = useGetAllOrganizationUsers();
  const [search, setSearch] = useState('');

  //=====================================================================

  const tableData = useMemo(() => {
    let data = organizationUsers;
    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter((u) => `${u.user?.email}`.toLowerCase().includes(q));
    }

    return data;
  }, [organizationUsers, search]);

  const columns = useMemo<ColumnDef<IOrganizationUser>[]>(
    () => [
      {
        header: 'No',
        cell: ({ row }) => row.index + 1,
      },
      {
        header: 'Email',
        accessorFn: (row) => row.user?.email,
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
      {
        header: 'Role',
        accessorKey: 'role',
        cell: ({ getValue }) => (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
            {getValue<string>()}
          </span>
        ),
      },
      {
        header: 'Status',
        accessorFn: (row) => row.user?.is_active,
        cell: ({ getValue }) =>
          getValue<boolean>() ? (
            <span className="text-green-600 font-medium">Active</span>
          ) : (
            <span className="text-red-500 font-medium">Inactive</span>
          ),
      },
    ],
    []
  );
  if (organizationUsersLoading)
    return (
      <div className="p-4 text-center">
        <Loader />
      </div>
    );
  if (organizationUsersError)
    return (
      <div className="p-4 text-center text-red-500">
        <ErrorFallback />
      </div>
    );

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">
        Daftar Users Pada Organisasi
      </h2>
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
