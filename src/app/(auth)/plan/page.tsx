import { RoleGuard } from '@/auth/guard';
import PlanPage from '@/features/subscription/plan/PlanPage';

export default function page() {
    return (
        <RoleGuard allowed={['ADMIN', 'REPRESENTATIVE']}>
            <PlanPage />
        </RoleGuard>
    );
}
