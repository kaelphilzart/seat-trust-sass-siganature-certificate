import { RoleGuard } from '@/auth/guard';
import TemplatePage from '@/features/template/TemplatePage'

export default function page() {
    return (
        <RoleGuard allowed={['ADMIN', 'REPRESENTATIVE']}>
            <TemplatePage />
        </RoleGuard>
    );
}
