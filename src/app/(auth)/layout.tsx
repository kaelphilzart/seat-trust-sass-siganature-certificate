'use client';

import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/auth/guard';
import { PlanProvider } from "@/auth/guard/PlanProvider";
import Header from '@/layout/auth/header/Header';
import Sidebar from '@/layout/auth/sidebar/Sidebar';
import { paths } from '@/routes/paths';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const noSidebarRoutes = [
    paths.batch.create,
    paths.participant.create,
  ];

  const isNoSidebar = noSidebarRoutes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <AuthGuard>
      <PlanProvider>
        {isNoSidebar ? (
          <div className="min-h-screen bg-gray-200 dark:bg-gray-950 py-10">

            <div className="w-full max-w-5xl mx-auto px-6">

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6">

                {children}

              </div>

            </div>

          </div>
        ) : (
          <div className='flex w-full min-h-screen'>
            <div className='page-wrapper flex w-full'>

              {/* Sidebar */}
              <div className='xl:block hidden'>
                <Sidebar />
              </div>

              <div className='body-wrapper w-full'>
                {/* Header */}
                <Header />

                {/* Body */}
                <div className="bg-lightgray dark:bg-dark mr-3 rounded-3xl min-h-[90vh]">
                  <div className="container mx-auto px-6 py-30">
                    {children}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </PlanProvider>
    </AuthGuard>
  );
}