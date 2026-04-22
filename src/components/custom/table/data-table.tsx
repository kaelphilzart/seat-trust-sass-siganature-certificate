'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ColumnDef,
  useReactTable,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InputSearch } from '@/components/ui/input-search';
import PaginationTable from '@/components/custom/pagination-table';
import Link from 'next/link';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterField: string;

  /** optional features */
  isFilterRowBasedOnValue?: string;
  isRemovePagination?: boolean;
  isFilterRow?: boolean;
  isAllRowKey?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  rowProps?: (row: any) => React.HTMLAttributes<HTMLTableRowElement>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterField,
  isFilterRow = false,
  isFilterRowBasedOnValue,
  isRemovePagination = true,
  isAllRowKey,
  viewAllHref,
  viewAllLabel,
  rowProps,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const TableData = isFilterRow
    ? table
        .getRowModel()
        .rows.filter((rowItems: any) =>
          isFilterRowBasedOnValue === isAllRowKey
            ? rowItems
            : rowItems.original?.status === isFilterRowBasedOnValue
        )
    : table.getRowModel().rows;

  // ===== PORTAL SEARCH =====
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const portalTarget =
    typeof window !== 'undefined'
      ? document.getElementById('search-table')
      : null;

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-dark shadow-sm rounded-md">
      {/* Search */}
      {mounted && portalTarget
        ? createPortal(
            <InputSearch
              placeholder={`Search ${filterField}`}
              value={
                (table.getColumn(filterField)?.getFilterValue() as string) ?? ''
              }
              onChange={(e) =>
                table.getColumn(filterField)?.setFilterValue(e.target.value)
              }
            />,
            portalTarget
          )
        : null}

      {/* Table */}
      <div className="min-w-180">
        <Table className="bg-light dark:bg-dark">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="last:w-0 text-left text-gray-700 dark:text-gray-200"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {TableData.length ? (
              TableData.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  {...(rowProps ? rowProps(row) : {})}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                      className="text-gray-800 dark:text-gray-200"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-lg font-semibold text-gray-500 dark:text-gray-400"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      {isRemovePagination ? (
        viewAllHref ? (
          <div className="flex justify-end border-t border-gray-200 dark:border-gray-700 px-4 py-3">
            <Link
              href={viewAllHref}
              className="text-sm font-medium text-black dark:text-white hover:underline"
            >
              {viewAllLabel ?? 'View all'}
            </Link>
          </div>
        ) : null
      ) : (
        <PaginationTable table={table} data={data} />
      )}
    </div>
  );
}
