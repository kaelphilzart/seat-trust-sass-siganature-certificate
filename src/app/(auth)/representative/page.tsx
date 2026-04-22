import { RoleGuard } from '@/auth/guard';
import RepresentativePage from '@/features/subscription/representative/RepresentativePage';

export default function page() {
  return (
    <RoleGuard allowed={['ADMIN']}>
      <RepresentativePage />
    </RoleGuard>
  );
}
