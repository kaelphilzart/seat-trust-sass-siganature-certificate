import { RoleGuard } from '@/auth/guard';
import OrganizationPage from '@/features/organization/organizations/OrganizationPage';

export default function page() {
  return (
    <RoleGuard allowed={['ADMIN', 'REPRESENTATIVE']}>
      <OrganizationPage />
    </RoleGuard>
  );
}
