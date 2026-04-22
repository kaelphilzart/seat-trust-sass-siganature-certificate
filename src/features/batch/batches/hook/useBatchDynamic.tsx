'use client';

import { useSession } from 'next-auth/react';
import { lazy } from 'react';
import NoAccessFallback from '@/auth/NoAccessFallback';

const AdminSection = lazy(
  () => import('../components/dynamic-section/AdminDynamicSection')
);

export function useBatchDynamic(batchId: string) {
  const { data: session } = useSession();

  const user = session?.user;

  const map: Record<string, React.ReactNode> = {
    ADMIN: <AdminSection batchId={batchId} />,
    // nanti tinggal nambah:
    // USER: <UserSection batchId={batchId} />,
    // MANAGER: <ManagerSection batchId={batchId} />,
  };

  const section = user?.role ? (map[user.role] ?? <NoAccessFallback />) : null;

  return { section };
}
