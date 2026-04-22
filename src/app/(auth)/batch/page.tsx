import { RoleGuard } from '@/auth/guard';
import BatchPage from '@/features/batch/batches/BatchPage';

export default function page() {
  return (
    <RoleGuard allowed={['ADMIN', 'REPRESENTATIVE']}>
      <BatchPage />
    </RoleGuard>
  );
}
