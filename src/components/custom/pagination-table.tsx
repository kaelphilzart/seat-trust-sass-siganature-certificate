'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function PaginationTable({ table, data }: any) {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const MAX_VISIBLE = 5;
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + MAX_VISIBLE - 1);

  return (
    <div className="flex flex-col items-center justify-end gap-2 py-3 sm:flex-row sm:gap-4">
      {/* Info Entries */}
      <div className="rounded-lg bg-white dark:bg-dark px-3 py-1.75 text-xs font-medium text-gray-500 dark:text-gray-300 shadow-sm">
        Showing&nbsp;
        <span className="text-black dark:text-white">
          {table.getRowModel().rows.length}
        </span>
        &nbsp;of&nbsp;
        <span className="text-black dark:text-white">{data.length}</span>
        &nbsp;Entries
      </div>

      {/* Pagination */}
      <div className="rounded-lg shadow-sm bg-white dark:bg-dark">
        <Pagination>
          <PaginationContent>
            {/* Prev */}
            <PaginationItem>
              <PaginationPrevious
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="cursor-pointer"
              />
            </PaginationItem>

            {/* Page numbers (MAX 5) */}
            {Array.from({ length: end - start + 1 }).map((_, i) => {
              const page = start + i;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={() => table.setPageIndex(page - 1)}
                    className="dark:text-gray-200 dark:bg-gray-700"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {/* Ellipsis */}
            {end < totalPages && (
              <PaginationItem>
                <span className="px-2 text-gray-400 dark:text-gray-500">
                  ...
                </span>
              </PaginationItem>
            )}

            {/* Next */}
            <PaginationItem>
              <PaginationNext
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="cursor-pointer"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
