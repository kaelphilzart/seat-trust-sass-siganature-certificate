'use client';
import { Suspense } from 'react';
import { useElementType } from './hooks/useElementType';
import { Skeleton } from '@/components/ui/skeleton';

export default function ElementTypePage() {
  const { section } = useElementType();

  return (
    <Suspense fallback={<Skeleton />}>
      {section}
    </Suspense>
  );
}
