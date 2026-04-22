import DashboardPage from '@/features/home/auth/DashboardPage';
import { RoleGuard } from '@/auth/guard';

export default function page() {
  return (
    <RoleGuard allowed={['ADMIN', 'REPRESENTATIVE']}>
      <DashboardPage />
    </RoleGuard>
  );
}
