import { RoleGuard } from '@/auth/guard';
import { decodeId } from '@/utils/encode';
import BatchDynamicPage from '@/features/batch/batches/BatchDynamicPage';
export default async function Page({ params }: { params: Promise<{ batchId: string }> }) {
  const decodedId = decodeId((await params).batchId);

  return (
    <RoleGuard allowed={['ADMIN', 'REPRESENTATIVE']}>
      <BatchDynamicPage batchId={decodedId} />
    </RoleGuard>
  );
}
