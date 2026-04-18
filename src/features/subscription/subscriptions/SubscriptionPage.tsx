'use client';
import { Suspense } from 'react';
import { useSubscription } from './hooks/useSubscription';
import { Skeleton } from '@/components/ui/skeleton';

export default function SubscriptionPage() {
  const { section } = useSubscription();

  return (
    <Suspense fallback={<Skeleton />}>
      {section}
    </Suspense>
  );
}
