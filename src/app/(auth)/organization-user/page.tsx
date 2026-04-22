import { RoleGuard } from '@/auth/guard';
import OrganizationUserpage from '@/features/organization/organization_user/OrganizationUserPage';

export default function page() {
  return (
    <RoleGuard allowed={['ADMIN', 'REPRESENTATIVE']}>
      <OrganizationUserpage />
    </RoleGuard>
  );
}
