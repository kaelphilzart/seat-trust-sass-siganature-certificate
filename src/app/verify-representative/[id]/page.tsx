import { decodeId } from '@/utils/encode';
import VerifyRepresentative from '@/features/verify/VerifyRepresentative';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const decodedId = decodeId((await params).id);

  return (
      <VerifyRepresentative repsentativeId={decodedId} />
  );
}
