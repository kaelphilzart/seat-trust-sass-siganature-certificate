import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { ISubscription, ICreateSubscription, IUpdateSubscription } from '@/types/subscription';
import { endpoints, request } from '@/utils/helper-server';
import { ApiResponse } from '@/types/request';
import { SWR_KEYS } from "@/lib/swrKeys";

// SWR options
const options = {
    revalidateIfStale: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

// ===========================
// GET ALL SUBSCRIPTIONS
// ===========================
export function useGetAllSubscriptions(planId?: string) {

    const { data, error, isLoading, isValidating } = useSWR<{ data: ISubscription[] }>(
        planId
            ? `${SWR_KEYS.subscriptions()}/${planId}`
            : SWR_KEYS.subscriptions(),
        (url) => request<{ data: ISubscription[] }>(url),
        options
    );

    const memoized = useMemo(() => ({
        subscriptions: data?.data || [],
        subscriptionsLoading: isLoading,
        subscriptionsIsValidating: isValidating,
        subscriptionsError: error,
    }), [data, isLoading, isValidating, error]);

    return memoized;
}


// ===========================
// CREATE SUBSCRIPTION
// ===========================
export async function createSubscriptionByParam(
    organizationId: string,
    data: ICreateSubscription
) {
    try {

        const res = await request<ApiResponse<ISubscription>>(
            `${SWR_KEYS.subscriptions()}/${organizationId}`,
            { method: 'POST', body: data }
        );
        await Promise.all([
            mutate(SWR_KEYS.subscriptions()),
            mutate(SWR_KEYS.organizationDetail(organizationId)),
            mutate(SWR_KEYS.organizations()),
        ]);
        return res;
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Gagal membuat subscription',
        };
    }
}

// ===========================
// PATCH SUBSCRIPTION
// ===========================
export const editSubscription = async (
    id: string,
    data: Partial<IUpdateSubscription>
) => {

    const res = await request<ApiResponse<ISubscription>>(
        SWR_KEYS.subscriptionDetail(id),
        {
            method: 'PATCH',
            body: data,
        }
    );

    const organizationId = res.data?.organization_id;

    await Promise.all([
        mutate(SWR_KEYS.subscriptionDetail(id), undefined, { revalidate: true }),
        mutate(SWR_KEYS.subscriptions(), undefined, { revalidate: true }),
        organizationId &&
        mutate(
            SWR_KEYS.organizationDetail(organizationId),
            undefined,
            { revalidate: true }
        ),

        mutate(SWR_KEYS.organizations(), undefined, { revalidate: true }),
    ]);

    return res;
};

// ===========================
// DELETE SUBSCRIPTION
// ===========================
export const deleteSubscription = async (id: string) => {
    const res = await request<ApiResponse>(
        SWR_KEYS.subscriptionDetail(id),
        { method: 'DELETE' }
    );

    await Promise.all([
        mutate(SWR_KEYS.subscriptionDetail(id)),
        mutate(SWR_KEYS.subscriptions()),
        mutate(SWR_KEYS.organizations()),
    ]);

    return res;
};