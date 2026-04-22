import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { endpoints, request } from '@/utils/helper-server';
import {
  ITemplatePositionBinding,
  ICreateTemplatePositionBinding,
} from '@/types/template-position-binding';
import { ApiResponse } from '@/types/request';

// base URL API
const URL_TEMPLATE_POSITION_BINDING = endpoints.templatePositionBinding;

// SWR options
const options = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ===========================
// GET ALL
// ===========================
export function useGetAllTemplatePositionBindings(batchId?: string) {
  const { data, error, isLoading, isValidating } = useSWR<{
    data: ITemplatePositionBinding[];
  }>(
    batchId
      ? `${URL_TEMPLATE_POSITION_BINDING}/${batchId}`
      : URL_TEMPLATE_POSITION_BINDING,
    (url) => request<{ data: ITemplatePositionBinding[] }>(url),
    options
  );
  const memoized = useMemo(
    () => ({
      templatePositionBindings: (data?.data ||
        []) as ITemplatePositionBinding[],
      templatePositionBindingsLoading: isLoading,
      templatePositionBindingsIsValidating: isValidating,
      templatePositionBindingsError: error,
    }),
    [data, isLoading, isValidating, error]
  );

  return memoized;
}

// ===========================
// GET ONE BY ID
// ===========================
// export function useGetOneTemplatePositionBinding(id?: string) {
//     const { data, error, isLoading } = useSWR<ITemplatePositionBinding>(
//         id ? `${URL_TEMPLATE_POSITION_BINDING}/${id}` : null,
//         (url: string) => request<ITemplatePositionBinding>(url)
//     );

//     const memoized = useMemo(() => ({
//         templatePositionBinding: data || null,
//         templatePositionBindingLoading: isLoading,
//         templatePositionBindingError: !!error,
//     }), [data, isLoading, error]);

//     return memoized;
// }

// ===========================
// CREATE BULK
// ===========================
export async function syncTemplatePositionBindings(
  data: ICreateTemplatePositionBinding[]
) {
  try {
    const res = await request<ApiResponse<unknown>>(
      URL_TEMPLATE_POSITION_BINDING,
      {
        method: 'POST', // 🔥 FULL SYNC (SAMA KAYAK TEMPLATE POSITION)
        body: data,
      }
    );

    await mutate(URL_TEMPLATE_POSITION_BINDING);

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
export async function deleteTemplatePositionBindingsBulk(ids: string[]) {
  try {
    const res = await request<ApiResponse<unknown>>(
      URL_TEMPLATE_POSITION_BINDING,
      {
        method: 'DELETE',
        body: { ids },
      }
    );

    await mutate(URL_TEMPLATE_POSITION_BINDING);

    return {
      success: true,
      message: res.message,
    };
  } catch (error: unknown) {
    throw error;
  }
}
