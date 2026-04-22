'use client';

import { useSession } from 'next-auth/react';
import { lazy, useMemo } from 'react';
import NoAccessFallback from '@/auth/NoAccessFallback';

const SuperAdminSection = lazy(
  () => import('../components/sections/SuperAdminSection')
);

export function useElementType() {
  const { data: session } = useSession();

  const SectionComponent = useMemo(() => {
    const user = session?.user;
    if (!user) return null;

    const map: Record<string, React.ReactNode> = {
      SUPERADMIN: <SuperAdminSection />,
    };

    return map[user.role] ?? <NoAccessFallback />;
  }, [session]);

  return {
    section: SectionComponent,
  };
}
