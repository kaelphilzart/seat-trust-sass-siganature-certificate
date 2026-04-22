import { NonAuthGuard } from '@/auth/guard';
import Header from '@/layout/no-auth/Header/Header';
import Footer from '@/layout/no-auth/Footer';
import ScrollToTop from '@/components/ScrollToTop';

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NonAuthGuard>
      <Header />
      {children}
      <Footer />
      <ScrollToTop />
    </NonAuthGuard>
  );
}
