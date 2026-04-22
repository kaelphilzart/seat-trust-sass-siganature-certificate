import { RoleGuard } from '@/auth/guard';
import UserPage from '@/features/user/UserPage';

export default function page() {
  return (
    <RoleGuard allowed={['ADMIN', 'REPRESENTATIVE']}>
      <UserPage />
    </RoleGuard>
  );
}
