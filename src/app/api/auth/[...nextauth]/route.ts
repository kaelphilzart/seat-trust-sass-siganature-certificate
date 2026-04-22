// src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import type { User } from '@/server/models/auth/users';
import type { OrganizationUser } from '@/server/models/organization/organization_users';
import type { RowDataPacket } from 'mysql2/promise';

// ==============================
// 🔥 EXTEND JWT TYPE (BIAR GA ERROR)
// ==============================
type CustomJWT = JWT & {
  id?: string;
  role?: string;
  organization_id?: string | null;
  features?: Record<string, string>;
  organization?: {
    id: string;
    name: string;
    plan?: {
      id: string;
      name: string;
    } | null;
  } | null;
};

// ==============================
// 🔥 SESSION USER TYPE
// ==============================
interface SessionUser {
  id: string;
  role: string;
  organization_id: string | null;
  features: Record<string, string>;
  email?: string | null;
  name?: string | null;

  organization?: {
    id: string;
    name: string;
    plan?: {
      id: string;
      name: string;
    } | null;
  } | null;
}

// ==============================
// 🔥 AUTH CONFIG (SOURCE OF TRUTH)
// ==============================
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials) return null;

        const [rows] = await db.query<RowDataPacket[]>(
          'SELECT * FROM users WHERE email = ? LIMIT 1',
          [credentials.email]
        );

        const user = rows[0] as User;

        if (!user || !user.is_active) return null;
        if (!(await bcrypt.compare(credentials.password!, user.password!)))
          return null;

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],

  callbacks: {
    // ==============================
    // 🔥 JWT CALLBACK (LOGIC SAMA)
    // ==============================
    async jwt({ token, user }) {
      const t = token as CustomJWT;

      if (user) {
        t.id = user.id;

        const [rows] = await db.query<RowDataPacket[]>(
          'SELECT * FROM organization_users WHERE user_id = ? LIMIT 1',
          [user.id]
        );

        const org_user = rows[0] as OrganizationUser | undefined;

        t.role = org_user?.role ?? 'SUPERADMIN';
        t.organization_id = org_user?.organization_id ?? null;

        if (org_user?.organization_id) {
          // 🔥 GET ORGANIZATION
          const [orgRows] = await db.query<RowDataPacket[]>(
            'SELECT id, name FROM organizations WHERE id = ? LIMIT 1',
            [org_user.organization_id]
          );

          const org = orgRows[0];

          // 🔥 GET SUBSCRIPTION
          const [subsRows] = await db.query<RowDataPacket[]>(
            `
            SELECT plan_id 
            FROM subscriptions 
            WHERE organization_id = ?
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [org_user.organization_id]
          );

          const planId = subsRows[0]?.plan_id;

          // 🔥 GET PLAN
          let plan = null;

          if (planId) {
            const [planRows] = await db.query<RowDataPacket[]>(
              'SELECT id, name FROM plans WHERE id = ? LIMIT 1',
              [planId]
            );

            plan = planRows[0] ?? null;
          }

          // 🔥 SET ORGANIZATION
          t.organization = org
            ? {
                id: org.id,
                name: org.name,
                plan: plan
                  ? {
                      id: plan.id,
                      name: plan.name,
                    }
                  : null,
              }
            : null;

          // 🔥 FEATURES
          if (planId) {
            const [featuresRows] = await db.query<RowDataPacket[]>(
              `
              SELECT 
                f.feature_key,
                pfv.value
              FROM plan_feature_values pfv
              JOIN features f ON f.id = pfv.feature_id
              WHERE pfv.plan_id = ?
              `,
              [planId]
            );

            t.features = (featuresRows as any[]).reduce(
              (acc, f) => {
                acc[f.feature_key] = f.value;
                return acc;
              },
              {} as Record<string, string>
            );
          } else {
            t.features = {};
          }
        } else {
          t.organization = null;
          t.features = {};
        }
      }

      return t;
    },

    // ==============================
    // 🔥 SESSION CALLBACK (FIX TYPE)
    // ==============================
    async session({ session, token }) {
      const t = token as CustomJWT;

      session.user = {
        ...(session.user ?? {}),
        id: t.id ?? 'guest',
        role: t.role ?? 'guest',
        organization_id: t.organization_id ?? null,
        features: t.features ?? {},
        organization: t.organization ?? null,
      } as SessionUser;

      return session;
    },
  },

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/',
  },
};

// ==============================
// 🔥 HANDLER
// ==============================
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
