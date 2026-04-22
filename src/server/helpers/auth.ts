// src/server/helpers/auth.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export interface AuthUser {
  id: string;
  role: string;
  organization_id: string | null;
}

export async function getAuthUser(): Promise<AuthUser> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return {
    id: session.user.id,
    role: session.user.role,
    organization_id: session.user.organization_id ?? null,
  };
}
