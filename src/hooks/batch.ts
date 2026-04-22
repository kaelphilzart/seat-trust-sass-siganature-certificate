import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { endpoints, request } from '@/utils/helper-server';
import { IBatch, ICreateBatch, IUpdateBatch } from '@/types/batch';
import { ApiResponse } from '@/types/request';

// base URL API
const URL_BATCH = endpoints.batch.base;
const URL_BATCH_DETAIL = endpoints.batch.detail;

// SWR options
const options = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ===========================
// GET ALL TEMPLATES
// ===========================
export function useGetAllBatch(organizationId?: string) {
  const { data, error, isLoading, isValidating } = useSWR<{ data: IBatch[] }>(
    organizationId ? `${URL_BATCH}/${organizationId}` : URL_BATCH,
    (url) => request<{ data: IBatch[] }>(url),
    options
  );
  const memoized = useMemo(
    () => ({
      Batches: (data?.data || []) as IBatch[],
      BatchesLoading: isLoading,
      BatchesIsValidating: isValidating,
      BatchesError: error,
    }),
    [data, isLoading, isValidating, error]
  );

  return memoized;
}

// GET ONE
export function useGetOneBatch(id?: string) {
  const { data, error, isLoading } = useSWR<IBatch>(
    id ? `${URL_BATCH_DETAIL}/${id}` : null,
    (url: string) => request<IBatch>(url)
  );

  const memoized = useMemo(
    () => ({
      batchOne: data || null,
      batchOneLoading: isLoading,
      batchOneError: !!error,
    }),
    [data, isLoading, error]
  );

  return memoized;
}

// ===========================
// CREATE ORGAniZATION USER
// ===========================
export async function createBatch(data: ICreateBatch) {
  try {
    const res = await request<ApiResponse<IBatch>>(URL_BATCH, {
      method: 'POST',
      body: data,
    });

    await mutate(URL_BATCH);

    return {
      success: true,
      data: res.data,
      message: res.message,
    };
  } catch (error: unknown) {
    throw error;
  }
}

// ===========================
// PATCH ORGANIZATION USER
// ===========================
export const editBatch = async (id: string, data: Partial<IUpdateBatch>) => {
  const res = await request<ApiResponse<IBatch>>(`${URL_BATCH}/${id}`, {
    method: 'PATCH',
    body: data,
  });

  await Promise.all([
    mutate(`${URL_BATCH}/${id}`),
    mutate((key) => typeof key === 'string' && key.startsWith(URL_BATCH)),
  ]);

  return res;
};
// ===========================
// DELETE ORGANIZATION USER
// ===========================
export const deleteBatch = async (id: string) => {
  console.log('DELETE ID:', id);

  const res = await request<ApiResponse>(`${URL_BATCH}/${id}`, {
    method: 'DELETE',
  });

  console.log('DELETE SUCCESS');

  await mutate((key) => {
    const match = typeof key === 'string' && key.startsWith(URL_BATCH);
    return match;
  });

  return res;
};
