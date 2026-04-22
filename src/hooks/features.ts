import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { IFeature, ICreateFeature, IUpdateFeature } from '@/types/feature';
import { endpoints, request } from '@/utils/helper-server';

// base URL API
const URL_FEATURE = endpoints.subscription.feature;

// SWR options
const options = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ===========================
// GET ALL FEATURES
// ===========================
export function useGetAllFeatures() {
  const { data, error, isLoading, isValidating } = useSWR<{ data: IFeature[] }>(
    URL_FEATURE,
    (url) => request<{ data: IFeature[] }>(url),
    options
  );

  const memoized = useMemo(
    () => ({
      features: (data?.data || []) as IFeature[],
      featuresLoading: isLoading,
      featuresIsValidating: isValidating,
      featuresError: error,
    }),
    [data, isLoading, isValidating, error]
  );

  return memoized;
}

// ===========================
// CREATE FEATURE
// ===========================
export async function createFeature(data: ICreateFeature) {
  try {
    const res = await request<IFeature>(URL_FEATURE, {
      method: 'POST',
      body: data,
    });

    // invalidate cache
    mutate((key) => typeof key === 'string' && key.startsWith(URL_FEATURE));

    return res;
  } catch (error: unknown) {
    throw error;
  }
}

// ===========================
// UPDATE FEATURE
// ===========================
export async function editFeature(id: string, data: Partial<IUpdateFeature>) {
  try {
    const res = await request<IFeature>(`${URL_FEATURE}/${id}`, {
      method: 'PATCH',
      body: data,
    });
    await Promise.all([
      mutate(`${URL_FEATURE}/${id}`), // Refresh detail feature ini
      mutate((key) => typeof key === 'string' && key.startsWith(URL_FEATURE)),
    ]);

    return res;
  } catch (error: unknown) {
    throw error;
  }
}

// ===========================
// DELETE FEATURE
// ===========================
export async function deleteFeature(
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${URL_FEATURE}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      let message = 'Terjadi kesalahan saat menghapus feature.';
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
      mutate(`${URL_FEATURE}/${id}`),
      mutate((key) => typeof key === 'string' && key.startsWith(URL_FEATURE)),
    ]);

    // DELETE sukses, 204 No Content → return success
    return { success: true };
  } catch (error: unknown) {
    throw error;
  }
}
