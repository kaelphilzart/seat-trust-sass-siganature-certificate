import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { endpoints, request } from '@/utils/helper-server';
import {
  IBatchRepresentative,
  ICreateBatchRepresentative,
} from '@/types/batch-representative';
import { ApiResponse } from '@/types/request';

// base URL API
const URL_BATCH_REPRESENTATIVE = endpoints.batchRepresentative;

// SWR options
const options = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ===========================
// GET ALL
// ===========================
export function useGetAllBatchRepresentatives(batchId?: string) {
  const { data, error, isLoading, isValidating } = useSWR<{
    data: IBatchRepresentative[];
  }>(
    batchId
      ? `${URL_BATCH_REPRESENTATIVE}/${batchId}`
      : URL_BATCH_REPRESENTATIVE,
    (url) => request<{ data: IBatchRepresentative[] }>(url),
    options
  );
  const memoized = useMemo(
    () => ({
      batchRepresentatives: (data?.data || []) as IBatchRepresentative[],
      batchRepresentativesLoading: isLoading,
      batchRepresentativesIsValidating: isValidating,
      batchRepresentativesError: error,
    }),
    [data, isLoading, isValidating, error]
  );

  return memoized;
}

// ===========================
// GET ONE BY ID
// ===========================
export function useGetOneBatchRepresentative(id?: string) {
  const { data, error, isLoading } = useSWR<IBatchRepresentative>(
    id ? `${URL_BATCH_REPRESENTATIVE}/${id}` : null,
    (url: string) => request<IBatchRepresentative>(url)
  );

  const memoized = useMemo(
    () => ({
      batchRepresentative: data || null,
      batchRepresentativeLoading: isLoading,
      batchRepresentativeError: !!error,
    }),
    [data, isLoading, error]
  );

  return memoized;
}

// ===========================
// CREATE BULK
// ===========================
export async function syncBatchRepresentatives(
  data: ICreateBatchRepresentative[]
) {
  try {
    const res = await request<ApiResponse<unknown>>(URL_BATCH_REPRESENTATIVE, {
      method: 'POST', // 🔥 FULL SYNC (SAMA KAYAK TEMPLATE POSITION)
      body: data,
    });

    await mutate(URL_BATCH_REPRESENTATIVE);

    return {
      success: true,
      message: res.message,
    };
  } catch (error: unknown) {
    throw error;
  }
}
// ===========================
// DELETE BULK
// ===========================
export async function deleteBatchRepresentativesBulk(ids: string[]) {
  try {
    const res = await request<ApiResponse<unknown>>(URL_BATCH_REPRESENTATIVE, {
      method: 'DELETE',
      body: { ids },
    });

    await mutate(URL_BATCH_REPRESENTATIVE);

    return {
      success: true,
      message: res.message,
    };
  } catch (error: unknown) {
    throw error;
  }
}
