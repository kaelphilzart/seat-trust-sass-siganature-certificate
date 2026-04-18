'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/custom/table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';

import ErrorFallback from '@/components/fallback/ErrorFallback';
import Loader from '@/components/fallback/Loader';
import { formatDateLong } from '@/utils/datetime';

import { useGetOneOrganization } from '@/hooks/organizations';
import { useGetAllPlanFeatureValue } from '@/hooks/plan-feature-value';
import { useGetAllOrganizationUsers } from '@/hooks/organization-user';

import { IPlanFeatureValue } from '@/types/plan-feature-value';
import { IOrganizationUser } from '@/types/organization-user';

export default function AdminSection() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const organizationId = session?.user?.organization_id;

    /* ================= FETCH ================= */
    const { organizationOne, organizationOneLoading, organizationOneError } =
        useGetOneOrganization(organizationId);

    const { organizationUsers, organizationUsersLoading, organizationUsersError } =
        useGetAllOrganizationUsers(organizationId);

    const planId = organizationOne?.subscription?.plan_id;

    const { planFeatureValues, planFeatureValuesLoading, planFeatureValuesError } =
        useGetAllPlanFeatureValue(planId);

    const [search, setSearch] = useState('');

    /* ================= TABLE DATA ================= */
    const tableData = useMemo(() => {
        let data = planFeatureValues || [];
        const q = search.trim().toLowerCase();

        if (q) {
            data = data.filter((f) =>
                `${f.feature}`.toLowerCase().includes(q)
            );
        }

        return data;
    }, [planFeatureValues, search]);

    const tableDataUser = useMemo(() => {
        return organizationUsers || [];
    }, [organizationUsers]);

    /* ================= COLUMNS ================= */
    const columns = useMemo<ColumnDef<IPlanFeatureValue>[]>(() => [
        { header: 'No', cell: ({ row }) => row.index + 1, size: 2 },
        { header: 'Fitur', accessorKey: 'feature.display_name', size: 3 },
        { header: 'Value', accessorKey: 'value' },
    ], []);

    const columnsUser = useMemo<ColumnDef<IOrganizationUser>[]>(() => [
        { header: 'No', cell: ({ row }) => row.index + 1, size: 2 },
        { header: 'Role', accessorKey: 'role', size: 2 },
        { header: 'Email', accessorKey: 'user.email', size: 2 },
    ], []);

    /* ================= LOADING STATE ================= */
    if (status === 'loading' || !organizationId) {
        return (
            <div className="p-4 text-center">
                <Loader />
            </div>
        );
    }

    if (
        organizationOneLoading ||
        planFeatureValuesLoading ||
        organizationUsersLoading
    ) {
        return (
            <div className="p-4 text-center">
                <Loader />
            </div>
        );
    }

    /* ================= ERROR ================= */
    if (
        organizationOneError ||
        planFeatureValuesError ||
        organizationUsersError
    ) {
        return (
            <div className="p-4 text-center text-red-500">
                <ErrorFallback />
            </div>
        );
    }

    /* ================= UI ================= */
    return (
        <div className="p-4 space-y-6">
            {/* HEADER */}
            <Card className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-semibold">
                        {organizationOne?.name}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>Slug: {organizationOne?.slug}</span>

                        {organizationOne?.subscription?.plan?.name && (
                            <Badge variant="lightPrimary">
                                {organizationOne.subscription.plan.name.toUpperCase()}
                            </Badge>
                        )}
                    </div>

                    <div className="text-sm">
                        <span className="font-medium">Active :</span>{' '}
                        {formatDateLong(organizationOne?.subscription?.start_date)} -{' '}
                        {formatDateLong(organizationOne?.subscription?.end_date)}
                    </div>
                </div>
            </Card>

            {/* TABLE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* FEATURE */}
                <Card>
                    <h3 className="text-xl font-semibold mb-4">
                        Fitur - fitur
                    </h3>
                    <DataTable
                        columns={columns}
                        data={tableData}
                        filterField="feature_key"
                        isRemovePagination
                    />
                </Card>

                {/* USERS */}
                <Card>
                    <h3 className="text-xl font-semibold mb-4">
                        Organization Users
                    </h3>
                    <DataTable
                        columns={columnsUser}
                        data={tableDataUser}
                        filterField="organization.role"
                        isRemovePagination
                    />
                </Card>
            </div>
        </div>
    );
}