import { RoleGuard } from '@/auth/guard';
import { decodeId } from '@/utils/encode';
import PlanDynamic from '@/features/subscription/plan/components/sections/PlanDynamic';
export default async function Page({ params }: { params: Promise<{ planId: string }> }) {
  const decodedId = decodeId((await params).planId);

  return (
    <RoleGuard allowed={['ADMIN', 'REPRESENTATIVE']}>
      <PlanDynamic PlanId={decodedId} />
    </RoleGuard>
  );
}
