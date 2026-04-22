// src/types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      organization_id: string | null;
      features: Record<string, string>; // <=== override default string
    } & DefaultSession['user'];
  }

  interface JWT {
    id?: string;
    role?: string;
    organization_id?: string | null;
    features?: Record<string, string>;
  }
}
