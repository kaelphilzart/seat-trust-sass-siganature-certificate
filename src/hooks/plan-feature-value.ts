import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { IPlanFeatureValue, IUpdatePlanFeatureValue, ICreatePlanFeatureValue } from '@/types/plan-feature-value';
import { endpoints, request } from '@/utils/helper-server';
import { ApiResponse } from '@/types/request';

// base URL API
const URL_PLAN_FEATURE = endpoints.subscription.PlanFeature;
// SWR options
const options = {
    revalidateIfStale: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

// ===========================
// GET ALL PLAN FEATURE VALUE
// ===========================
export function useGetAllPlanFeatureValue(planId?: string) {
    const { data, error, isLoading, isValidating } = useSWR<{ data: IPlanFeatureValue[] }>(
        planId ? `${URL_PLAN_FEATURE}/${planId}` : URL_PLAN_FEATURE,
        (url) => request<{ data: IPlanFeatureValue[] }>(url),
        options
    );

    const memoized = useMemo(() => ({
        planFeatureValues: (data?.data || []) as IPlanFeatureValue[],
        planFeatureValuesLoading: isLoading,
        planFeatureValuesIsValidating: isValidating,
        planFeatureValuesError: error,
    }), [data, isLoading, isValidating, error]);

    return memoized;
}


// ===========================
// CREATE PLAN FEATURE VALUE
// ===========================
export async function createPlanFeatureValueByParam(
    planId: string,
    data: ICreatePlanFeatureValue
) {
    try {
        const res = await request<ApiResponse<IPlanFeatureValue>>(
            `${URL_PLAN_FEATURE}/${planId}`,
            { method: 'POST', body: data }
        );
        await Promise.all([
            mutate(`${URL_PLAN_FEATURE}/${planId}`), // refresh detail
            mutate((key) => typeof key === 'string' && key.startsWith(URL_PLAN_FEATURE)), // refresh list
        ]);
        return res;
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Gagal membuat plan feature',
        };
    }
}

// ===========================
// PATCH PLAN FEATURE VALUE
// ===========================
export const editPlanFeatureValue = async (
    id: string,
    data: Partial<IUpdatePlanFeatureValue>
) => {
    const res = await request<ApiResponse<IPlanFeatureValue>>(
        `${URL_PLAN_FEATURE}/${id}`,
        {
            method: 'PATCH',
            body: data,
        }
    );
    await Promise.all([
        mutate(`${URL_PLAN_FEATURE}/${id}`), // refresh detail
        mutate((key) => typeof key === 'string' && key.startsWith(URL_PLAN_FEATURE)), // refresh list
    ]);
    return res;
};

// ===========================
// DELETE PLAN FEATURE VALUE
// ===========================
export const deletePlanFeatureValue = async (id: string) => {
    const res = await request<ApiResponse>(
        `${URL_PLAN_FEATURE}/${id}`,
        { method: 'DELETE' }
    );
    await Promise.all([
        mutate(`${URL_PLAN_FEATURE}/${id}`),
        mutate((key) => typeof key === 'string' && key.startsWith(URL_PLAN_FEATURE)),
    ]);
    return res;
};