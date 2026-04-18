'use client';
import { Suspense } from 'react';
import { useRepresentative } from './hooks/useRepresentative';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrganizationAssetPage() {
  const { section } = useRepresentative();

  return (
    <Suspense fallback={<Skeleton />}>
      {section}
    </Suspense>
  );
}
