import { RoleGuard } from '@/auth/guard';
import CreateTemplatePage from '@/features/template/components/sections/CreatePage';

export default function page() {
  return (
    <RoleGuard allowed={['ADMIN', 'REPRESENTATIVE']}>
      <CreateTemplatePage />
    </RoleGuard>
  );
}
