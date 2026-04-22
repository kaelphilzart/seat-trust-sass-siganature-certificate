import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        // 🔥 ini contoh, sesuaikan sama DB lu
        const user = {
          id: '1',
          email: credentials?.email,
          role: 'ADMIN',
          organization_id: 'org-123',
        };

        if (!user) return null;

        return user;
      },
    }),
  ],

  session: {
    strategy: 'jwt', // 🔥 penting
  },

  callbacks: {
    async jwt({ token, user }) {
      // 🔥 simpan data ke token
      if (user) {
        token.role = (user as any).role;
        token.organization_id = (user as any).organization_id;
      }
      return token;
    },

    async session({ session, token }) {
      // 🔥 inject ke session (ini yang lu pakai di API)
      if (session.user) {
        session.user.role = token.role as string;
        session.user.organization_id = token.organization_id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/',
  },

  secret: process.env.NEXTAUTH_SECRET,
};
