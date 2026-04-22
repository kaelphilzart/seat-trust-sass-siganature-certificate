import { RoleGuard } from '@/auth/guard';
import OrganizationAssetPage from '@/features/organization/organization-assets/OrganizationAssetPage';

export default function page() {
  return (
    <RoleGuard allowed={['ADMIN']}>
      <OrganizationAssetPage />
    </RoleGuard>
  );
}
