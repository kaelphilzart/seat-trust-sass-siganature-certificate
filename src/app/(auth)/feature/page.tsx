import { RoleGuard } from '@/auth/guard';
import FeaturePage from '@/features/subscription/feature/FeaturePage';

export default function page() {
  return (
    <RoleGuard allowed={['ADMIN', 'REPRESENTATIVE']}>
      <FeaturePage />
    </RoleGuard>
  );
}
