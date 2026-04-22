import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { endpoints, request } from '@/utils/helper-server';
import {
  ITemplatePosition,
  ICreateTemplatePosition,
  IUpdateTemplatePosition,
} from '@/types/template-position';
import { ApiResponse } from '@/types/request';

// base URL API
const URL_TEMPLATE_POSITION = endpoints.templatePosition.base;

// SWR options
const options = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ===========================
// GET ALL TEMPLATES
// ===========================
export function useGetAllTemplatePositions(batchId?: string) {
  const { data, error, isLoading, isValidating } = useSWR<{
    data: ITemplatePosition[];
  }>(
    batchId ? `${URL_TEMPLATE_POSITION}/${batchId}` : URL_TEMPLATE_POSITION,
    (url) => request<{ data: ITemplatePosition[] }>(url),
    options
  );
  const memoized = useMemo(
    () => ({
      templatePositions: (data?.data || []) as ITemplatePosition[],
      templatePositionsLoading: isLoading,
      templatePositionsIsValidating: isValidating,
      templatePositionsError: error,
    }),
    [data, isLoading, isValidating, error]
  );

  return memoized;
}

// GET ONE
export function useGetOneTemplatePosition(id?: string) {
  const { data, error, isLoading } = useSWR<ITemplatePosition>(
    id ? `${URL_TEMPLATE_POSITION}/${id}` : null,
    (url: string) => request<ITemplatePosition>(url)
  );

  const memoized = useMemo(
    () => ({
      templatePosition: data || null,
      templatePositionLoading: isLoading,
      templatePositionError: !!error,
    }),
    [data, isLoading, error]
  );

  return memoized;
}

// ===========================
// CREATE ORGAniZATION USER
// ===========================
export async function createTemplatePositionBulk(
  data: ICreateTemplatePosition[]
) {
  try {
    const res = await request<ApiResponse<unknown>>(URL_TEMPLATE_POSITION, {
      method: 'POST',
      body: data, // 🔥 langsung array
    });

    await mutate(URL_TEMPLATE_POSITION);

    return {
      success: true,
      message: res.message,
    };
  } catch (error: unknown) {
    throw error;
  }
}

// ===========================
// PATCH
// ===========================
export async function editTemplatePositionBulk(
  data: (IUpdateTemplatePosition & { id: string })[]
) {
  try {
    const res = await request<ApiResponse<unknown>>(URL_TEMPLATE_POSITION, {
      method: 'PATCH',
      body: data, // 🔥 langsung array (bulk)
    });

    await mutate(URL_TEMPLATE_POSITION);

    return {
      success: true,
      message: res.message,
    };
  } catch (error: unknown) {
    throw error;
  }
}
// ===========================
// DELETE ORGANIZATION USER
// ===========================
export const deleteTemplatePosition = async (id: string) => {
  const res = await request<ApiResponse>(`${URL_TEMPLATE_POSITION}/${id}`, {
    method: 'DELETE',
  });
  await Promise.all([
    mutate(`${URL_TEMPLATE_POSITION}/${id}`),
    mutate(
      (key) => typeof key === 'string' && key.startsWith(URL_TEMPLATE_POSITION)
    ),
  ]);
  return res;
};

export async function syncTemplatePositionsBulk(
  data: (ICreateTemplatePosition & { id?: string })[]
) {
  try {
    const res = await request<ApiResponse<unknown>>(URL_TEMPLATE_POSITION, {
      method: 'POST', // FULL SYNC ALWAYS POST
      body: data,
    });

    await mutate(URL_TEMPLATE_POSITION);

    return {
      success: true,
      message: res.message,
    };
  } catch (error: unknown) {
    throw error;
  }
}
