import { RoleGuard } from '@/auth/guard';
import ElementTypePage from '@/features/element-type/ElementTypePage';

export default function page() {
  return (
    <RoleGuard allowed={[]}>
      <ElementTypePage />
    </RoleGuard>
  );
}
