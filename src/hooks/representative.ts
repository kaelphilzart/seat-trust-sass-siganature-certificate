import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { endpoints, request } from '@/utils/helper-server';
import {
  ICreateRepresentative,
  IRepresentative,
  IUpdateRepresentative,
} from '@/types/representative';
import { ApiResponse } from '@/types/request';

// base URL API
const URL_REPRESENTATIVE = endpoints.representative;

// SWR options
const options = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ===========================
// GET ALL
// ===========================
export function useGetAllRepresentatives(organizationId?: string) {
  const { data, error, isLoading, isValidating } = useSWR<{
    data: IRepresentative[];
  }>(
    organizationId
      ? `${URL_REPRESENTATIVE}/${organizationId}`
      : URL_REPRESENTATIVE,
    (url) => request<{ data: IRepresentative[] }>(url),
    options
  );
  const memoized = useMemo(
    () => ({
      representatives: (data?.data || []) as IRepresentative[],
      representativesLoading: isLoading,
      representativesIsValidating: isValidating,
      representativesError: error,
    }),
    [data, isLoading, isValidating, error]
  );

  return memoized;
}

// GET ONE
export function useGetOneRepresentative(id?: string) {
  const { data, error, isLoading } = useSWR<IRepresentative>(
    id ? `${URL_REPRESENTATIVE}/${id}` : null,
    (url: string) => request<IRepresentative>(url)
  );

  const memoized = useMemo(
    () => ({
      representative: data || null,
      representativeLoading: isLoading,
      representativeError: !!error,
    }),
    [data, isLoading, error]
  );

  return memoized;
}

// ===========================
// CREATE
// ===========================
export async function createRepresentative(data: ICreateRepresentative) {
  try {
    const res = await request<ApiResponse<IRepresentative>>(
      URL_REPRESENTATIVE,
      {
        method: 'POST',
        body: data,
      }
    );

    await mutate(
      (key) => typeof key === 'string' && key.startsWith(URL_REPRESENTATIVE)
    );

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
// PATCH
// ===========================
export const editRepresentative = async (
  id: string,
  data: Partial<IUpdateRepresentative>
) => {
  const res = await request<ApiResponse<IRepresentative>>(
    `${URL_REPRESENTATIVE}/${id}`,
    {
      method: 'PATCH',
      body: data,
    }
  );

  await mutate(
    (key) => typeof key === 'string' && key.startsWith(URL_REPRESENTATIVE)
  );

  return res;
};
// ===========================
// DELETE
// ===========================
export const deleteRepresentative = async (id: string) => {
  const res = await request<ApiResponse>(`${URL_REPRESENTATIVE}/${id}`, {
    method: 'DELETE',
  });
  await mutate(
    (key) => typeof key === 'string' && key.startsWith(URL_REPRESENTATIVE)
  );
  return res;
};
