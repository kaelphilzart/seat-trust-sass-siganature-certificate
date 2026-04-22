import { RoleGuard } from '@/auth/guard';
import { decodeId } from '@/utils/encode';
import TemplateDetail from '@/features/template/components/sections/TemplateDetail';
export default async function Page({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const decodedId = decodeId((await params).templateId);

  return (
    <RoleGuard allowed={['ADMIN', 'REPRESENTATIVE']}>
      <TemplateDetail templateId={decodedId} />
    </RoleGuard>
  );
}
