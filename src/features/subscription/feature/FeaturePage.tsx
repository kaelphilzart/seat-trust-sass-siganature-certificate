'use client';
import { Suspense } from 'react';
import { useFeature } from './hooks/useFeature';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeaturePage() {
  const { section } = useFeature();

  return (
    <Suspense fallback={<Skeleton />}>
      {section}
    </Suspense>
  );
}
