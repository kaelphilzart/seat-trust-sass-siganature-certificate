import { RoleGuard } from '@/auth/guard';
import CreatePage from '@/features/subscription/plan/components/form/CreatePage';

export default function page() {
    return (
        <RoleGuard allowed={['ADMIN', 'REPRESENTATIVE']}>
            <CreatePage/>
        </RoleGuard>
    );
}
