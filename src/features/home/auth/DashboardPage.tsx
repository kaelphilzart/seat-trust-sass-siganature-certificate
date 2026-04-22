'use client';
import { Suspense } from 'react';
import { useDashboard } from './hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { section } = useDashboard();
  return <Suspense fallback={<Skeleton />}>{section}</Suspense>;
}
