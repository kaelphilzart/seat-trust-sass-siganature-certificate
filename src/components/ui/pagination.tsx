'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav role="navigation" aria-label="pagination" className={cn('mx-auto flex w-full justify-end', className)} {...props} />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn(
        'flex flex-row items-center overflow-hidden rounded-lg bg-white dark:bg-dark shadow-sm',
        className
      )}
      {...props}
    />
  )
);
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn('', className)} {...props} />
);
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
} & React.ComponentProps<'a'>;

const PaginationLink = ({ className, isActive, ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      'grid h-8 w-8 place-content-center rounded-none text-xs text-gray-500 dark:text-gray-200 shadow-none ring-0 hover:border-x hover:border-gray-300 dark:hover:border-gray-600',
      isActive &&
        'border-x border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600',
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({
  className,
  disabled,
  ...props
}: PaginationLinkProps & { disabled?: boolean }) => (
  <PaginationLink
    aria-label="Go to previous page"
    className={cn(
      'gap-1 rounded-l-lg border-r border-gray-300 dark:border-gray-600 pl-2.5 hover:border-l-0',
      disabled && 'pointer-events-none cursor-not-allowed opacity-50',
      className
    )}
    {...props}
  >
    <ChevronLeft className="h-4 w-4 text-black dark:text-white" />
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
  className,
  disabled,
  ...props
}: PaginationLinkProps & { disabled?: boolean }) => (
  <PaginationLink
    aria-label="Go to next page"
    className={cn(
      'gap-1 rounded-r-lg border-l border-gray-300 dark:border-gray-600 pr-2.5 hover:border-r-0',
      disabled && 'pointer-events-none cursor-not-allowed opacity-50',
      className
    )}
    {...props}
  >
    <ChevronRight className="h-4 w-4 text-black dark:text-white" />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};