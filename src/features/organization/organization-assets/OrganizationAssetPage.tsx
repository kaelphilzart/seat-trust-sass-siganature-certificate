'use client';
import { Suspense } from 'react';
import { useOrganizationAsset } from './hooks/useOrganizationAsset';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrganizationAssetPage() {
  const { section } = useOrganizationAsset();

  return (
    <Suspense fallback={<Skeleton />}>
      {section}
    </Suspense>
  );
}
