import { RoleGuard } from '@/auth/guard';
import { decodeId } from '@/utils/encode';
import CreateParticipant from '@/features/batch/batches/components/sections/CreateParticipant';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const decodedId = decodeId((await params).id);

  return (
    <RoleGuard allowed={['ADMIN', 'REPRESENTATIVE']}>
      <CreateParticipant batchId={decodedId} />
    </RoleGuard>
  );
}
