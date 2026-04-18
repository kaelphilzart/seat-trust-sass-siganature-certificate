'use client';
import { Suspense } from 'react';
import { useTemplate } from './hook/useTemplate';
import { Skeleton } from '@/components/ui/skeleton';

export default function TemplatePage() {
  const { section } = useTemplate();

  return (
    <Suspense fallback={<Skeleton />}>
      {section}
    </Suspense>
  );
}
