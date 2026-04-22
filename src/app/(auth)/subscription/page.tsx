import { RoleGuard } from '@/auth/guard';
import SubscriptionPage from '@/features/subscription/subscriptions/SubscriptionPage';

export default function page() {
  return (
    <RoleGuard allowed={['ADMIN', 'REPRESENTATIVE']}>
      <SubscriptionPage />
    </RoleGuard>
  );
}
