import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import '../style/css/globals.css';
import { ClientSessionProvider } from '@/auth/session-provider';
import { ProgressBar } from '@/components/progress-bar';
import { AlertProvider } from '@/components/alert/alert-dialog-global';
import { ThemeProvider } from '@/components/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// ==============================
// Metadata
// ==============================
export const metadata: Metadata = {
  title: 'SaaS-certif',
  description:
    'Pembuatan ceritifcate online dengna approval atau validasi sistem dan public',
  keywords: 'attendance, absensi, karyawan, kehadiran, sistem absensi',
  manifest: '/manifest.json',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    { rel: 'apple-touch-icon', sizes: '180x180', url: '/apple-touch-icon.png' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AlertProvider>
            <ClientSessionProvider>
              <ProgressBar>{children}</ProgressBar>
            </ClientSessionProvider>
          </AlertProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
