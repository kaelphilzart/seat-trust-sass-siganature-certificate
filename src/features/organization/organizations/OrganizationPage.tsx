'use client';
import { Suspense } from 'react';
import { useOrganization } from './hooks/useOrganization';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrganizationPage() {
  const { section } = useOrganization();

  return (
    <Suspense fallback={<Skeleton />}>
      {section}
    </Suspense>
  );
}
