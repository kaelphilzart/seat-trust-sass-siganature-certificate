'use client';
import { Suspense } from 'react';
import { useBatchDynamic } from './hook/useBatchDynamic';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  batchId: string;
}

export default function BatchDynamicPage({ batchId }: Props) {
  const { section } =  useBatchDynamic(batchId);

  return (
    <Suspense fallback={<Skeleton />}>
      {section}
    </Suspense>
  );
}
