'use client';
import { Suspense } from 'react';
import { usePlan } from './hooks/usePlan';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlanPage() {
  const { section } = usePlan();

  return <Suspense fallback={<Skeleton />}>{section}</Suspense>;
}
