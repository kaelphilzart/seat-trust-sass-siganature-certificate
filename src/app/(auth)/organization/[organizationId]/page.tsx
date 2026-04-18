import { RoleGuard } from '@/auth/guard';
import { decodeId } from '@/utils/encode';
import OrganizationDynamic from '@/features/organization/organizations/components/sections/OrganizationDynamic';
export default async function Page({ params }: { params: Promise<{ organizationId: string }> }) {
  const decodedId = decodeId((await params).organizationId);

  return (
    <RoleGuard allowed={['ADMIN', 'REPRESENTATIVE']}>
      <OrganizationDynamic organizationId={decodedId} />
    </RoleGuard>
  );
}
