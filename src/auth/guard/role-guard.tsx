'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { paths } from '@/routes/paths';

type Props = { allowed: string[]; children: ReactNode };

export default function RoleGuard({ allowed, children }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    const role = session?.user?.role;

    if (status === 'unauthenticated') {
      router.replace(paths.universal.home);
      return;
    }

    if (role && role !== 'SUPERADMIN' && !allowed.includes(role)) {
      router.replace('/unauthorized');
      return;
    }

    setChecked(true);
  }, [status, session, allowed, router]);

  if (!checked) return null;
  return <>{children}</>;
}
