'use client';
import { Suspense } from 'react';
import { useUser } from './hooks/useUser';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserPage() {
  const { section } = useUser();

  return (
    <Suspense fallback={<Skeleton />}>
      {section}
    </Suspense>
  );
}
