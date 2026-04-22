'use client';

import { useSession } from 'next-auth/react';
import { lazy, useMemo } from 'react';
import NoAccessFallback from '@/auth/NoAccessFallback';

const AdminSection = lazy(() => import('../components/sections/AdminSection'));
const SuperAdminSection = lazy(
  () => import('../components/sections/SuperAdminSection')
);

export function useBatch() {
  const { data: session } = useSession();

  const SectionComponent = useMemo(() => {
    const user = session?.user;
    if (!user) return null;

    const map: Record<string, React.ReactNode> = {
      SUPERADMIN: <SuperAdminSection />,
      ADMIN: <AdminSection />,
    };

    return map[user.role] ?? <NoAccessFallback />;
  }, [session]);

  return {
    section: SectionComponent,
  };
}
