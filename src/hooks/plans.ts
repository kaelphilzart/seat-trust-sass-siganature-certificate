import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { IPlan, ICreatePlan, IUpdatePlan } from '@/types/plan';
import { endpoints, request } from '@/utils/helper-server';
import { ICreatePlanFeatureValue } from '@/types/plan-feature-value';

// base URL API
const URL_PLAN = endpoints.subscription.plan;
const URL_PLAN_FEATURE = endpoints.subscription.PlanFeature;

// SWR options
const options = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ===========================
// GET ALL PLANS
// ===========================
export function useGetAllPlan() {
  const { data, error, isLoading, isValidating } = useSWR<{ data: IPlan[] }>(
    URL_PLAN,
    (url) => request<{ data: IPlan[] }>(url),
    options
  );

  const memoized = useMemo(() => ({
    plans: (data?.data || []) as IPlan[],
    plansLoading: isLoading,
    plansIsValidating: isValidating,
    plansError: error,
  }), [data, isLoading, isValidating, error]);

  return memoized;
}

// GET ONE
export function useGetOnePlan(id?: string) {
  const { data, error, isLoading } = useSWR<IPlan>(
    id ? `${URL_PLAN}/${id}` : null,
    (url: string) => request<IPlan>(url)
  );

  const memoized = useMemo(() => ({
    planOne: data || null,
    planOneLoading: isLoading,
    planOneError: !!error,
  }), [data, isLoading, error]);

  return memoized;
}

// ===========================
// CREATE PLAN
// ===========================
export async function createPlan(
  data: ICreatePlan,
  featureValues?: Record<string, string | number | boolean>
) {
  try {
    // 1️⃣ Buat plan dulu
    const res = await request<{ message: string; data: IPlan }>(URL_PLAN, {
      method: 'POST',
      body: data,
    });

    const plan = res.data; // ✅ ambil plan dari data

    if (!plan?.id) {
      throw new Error('Plan gagal dibuat, plan_id tidak tersedia');
    }

    // 2️⃣ Kalau ada featureValues → bulk insert plan feature values
    if (featureValues && Object.keys(featureValues).length > 0) {
      const payload: ICreatePlanFeatureValue[] = Object.entries(featureValues).map(
        ([feature_id, value]) => ({
          plan_id: plan.id,
          feature_id,
          value:
            typeof value === 'boolean'
              ? value.toString()
              : typeof value === 'number'
                ? value.toString()
                : value,
        })
      );

      await request<ICreatePlanFeatureValue[]>(URL_PLAN_FEATURE, {
        method: 'POST',
        body: payload,
      });
    }

    // 3️⃣ invalidate cache untuk plan
    mutate((key) => typeof key === 'string' && key.startsWith(URL_PLAN));

    return plan;
  } catch (error: any) {
    console.error('Error saat membuat plan:', error.message || error);
    return false;
  }
}

// ===========================
// UPDATE PLAN
// ===========================
export async function editPlan(id: string, data: Partial<IUpdatePlan>) {
  try {
    const res = await request<IUpdatePlan>(`${URL_PLAN}/${id}`, { method: 'PATCH', body: data });

    // update cache lokal SWR
    mutate(
      URL_PLAN,
      (existing: any) => {
        if (!existing?.data) return { data: [res] };
        return {
          ...existing,
          data: existing.data.map((item: IPlan) => (item.id === id ? { ...item, ...data } : item)),
        };
      },
      false
    );

    // invalidate semua cache plan
    mutate((key) => typeof key === 'string' && key.startsWith(URL_PLAN));

    return res;
  } catch (error: any) {
    console.error('Error saat mengupdate plan:', error.message || error);
    return false;
  }
}

// ===========================
// DELETE PLAN
// ===========================
export async function deletePlan(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${URL_PLAN}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      let message = 'Terjadi kesalahan saat menghapus plan.';
      try {
        const json = await res.json();
        message = json.message || message;
      } catch {
        // kalau ga ada JSON, tetap pakai default message
      }
      return { success: false, message };
    }

    // Invalidate SWR cache
    await Promise.all([
      mutate(`${URL_PLAN}/${id}`),
      mutate((key) => typeof key === 'string' && key.startsWith(URL_PLAN)),
    ]);

    return { success: true };
  } catch (error: any) {
    console.error('Error saat menghapus plan:', error?.message || error);
    return {
      success: false,
      message: error?.message || 'Terjadi kesalahan saat menghapus plan.',
    };
  }
}