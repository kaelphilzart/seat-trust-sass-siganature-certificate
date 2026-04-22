'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LoadingScreen } from '@/components/animate/loading-screen';
import { paths } from '@/routes/paths';

type Props = { children: ReactNode };

export default function NonAuthGuard({ children }: Props) {
  const { status } = useSession();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated') {
      router.replace(paths.dashboard);
      return;
    }

    setChecked(true);
  }, [status, router]);

  if (status === 'loading' || !checked) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
