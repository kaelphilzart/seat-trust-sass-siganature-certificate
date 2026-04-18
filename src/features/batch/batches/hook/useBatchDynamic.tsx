'use client';

import { useSession } from 'next-auth/react';
import { lazy, useEffect, useMemo } from 'react';
import NoAccessFallback from '@/auth/NoAccessFallback';


const AdminSection = lazy(() => import('../components/dynamic-section/AdminDynamicSection'));


export function useBatchDynamic(batchId: string){
  
 const { data: session } = useSession();

  const SectionComponent = useMemo(() => {
    const user = session?.user;
    if (!user) return null;

    const map: Record<string, React.ReactNode> = {
      ADMIN: <AdminSection batchId={batchId}/>,
    };

    return map[user.role] ?? <NoAccessFallback />;
  }, [session]);

  return {
    section: SectionComponent,
  };
}
