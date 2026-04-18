'use client';
import { Suspense } from 'react';
import { useOrganizationUser } from './hooks/useOrganizationUser';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrganizationUserPage() {
  const { section } = useOrganizationUser();

  return (
    <Suspense fallback={<Skeleton />}>
      {section}
    </Suspense>
  );
}
