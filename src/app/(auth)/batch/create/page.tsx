import { RoleGuard } from '@/auth/guard';
import CreateBatch from '@/features/batch/batches/components/sections/CreateBatch';
import { decodeId } from '@/utils/encode';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ batch_id?: string }>;
}) {
  const params = await searchParams;

  const batchId = params.batch_id
    ? decodeId(params.batch_id)
    : null;

  return (
    <RoleGuard allowed={['ADMIN', 'REPRESENTATIVE']}>
      <CreateBatch batchId={batchId} />
    </RoleGuard>
  );
}