'use client';
import { Suspense } from 'react';
import { useBatch } from './hook/useBatch';
import { Skeleton } from '@/components/ui/skeleton';

export default function BatchPage() {
  const { section } = useBatch();

  return <Suspense fallback={<Skeleton />}>{section}</Suspense>;
}
