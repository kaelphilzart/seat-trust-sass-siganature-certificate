import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { endpoints, request, requestFile } from '@/utils/helper-server';
import {
  IElementType,
  ICreateElementType,
  IUpdateElementType,
} from '@/types/element-type';
import { ApiResponse } from '@/types/request';

// base URL API
const URL_ELEMENT_TYPE = endpoints.elementType.base;

// SWR options

// ===========================
// GET ALL TEMPLATES
// ===========================
export function useGetAllElementType(options?: object) {
  const { data, error, isLoading, isValidating } = useSWR<{
    data: IElementType[];
  }>(
    URL_ELEMENT_TYPE,
    (url) => request<{ data: IElementType[] }>(url),
    options
  );

  const memoized = useMemo(
    () => ({
      elementTypes: data?.data || [],
      elementTypesLoading: isLoading,
      elementTypesIsValidating: isValidating,
      elementTypesError: error,
    }),
    [data, isLoading, isValidating, error]
  );

  return memoized;
}

// GET ONE
export function useGetOneElementType(id?: string) {
  const { data, error, isLoading } = useSWR<IElementType>(
    id ? `${URL_ELEMENT_TYPE}/${id}` : null,
    (url: string) => request<IElementType>(url)
  );

  const memoized = useMemo(
    () => ({
      elementTypeOne: data || null,
      templateOneLoading: isLoading,
      elementTypeOneError: !!error,
    }),
    [data, isLoading, error]
  );

  return memoized;
}

// ===========================
// CREATE
// ===========================
export async function createElementType(
  data: ICreateElementType & { file: File }
) {
  const formData = new FormData();

  formData.append('name', data.name ?? '');

  if (data.code) formData.append('code', data.code);
  formData.append('file', data.file);

  if (data.default_width !== undefined)
    formData.append('default_width', String(data.default_width));

  if (data.default_height !== undefined)
    formData.append('default_height', String(data.default_height));

  if (data.default_rotation !== undefined)
    formData.append('default_rotation', String(data.default_rotation));

  // ✅ NEW FIELDS
  if (data.feature_key) formData.append('feature_key', data.feature_key);
  if (data.ui_type) formData.append('ui_type', data.ui_type);
  if (data.element_kind) formData.append('element_kind', data.element_kind);
  if (data.asset_type) formData.append('asset_type', data.asset_type);

  const res = await requestFile<ApiResponse<ICreateElementType>>(
    URL_ELEMENT_TYPE,
    {
      method: 'POST',
      body: formData,
    }
  );

  await mutate(URL_ELEMENT_TYPE);

  return {
    success: true,
    data: res.data,
    message: res.message,
  };
}

// ===========================
// PATCH ELEMENT TYPE
// ===========================
export async function editElementType(
  id: string,
  data: IUpdateElementType
): Promise<{ success: boolean; data?: IElementType; message: string }> {
  try {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      // ✅ file handling
      if (key === 'file_path' && value instanceof File) {
        formData.append('file', value);
        return;
      }

      // ✅ number langsung stringify
      formData.append(key, String(value));
    });

    const res = await requestFile<ApiResponse<IElementType>>(
      `${URL_ELEMENT_TYPE}/${id}`,
      {
        method: 'PATCH',
        body: formData,
      }
    );

    await Promise.all([
      mutate(`${URL_ELEMENT_TYPE}/${id}`),
      mutate(
        (key) => typeof key === 'string' && key.startsWith(URL_ELEMENT_TYPE)
      ),
    ]);

    return {
      success: true,
      data: res.data,
      message: res.message || 'Berhasil update',
    };
  } catch (error: unknown) {
    throw error;
  }
}
// ===========================
// DELETE ELEMENT TYPE
// ===========================
export const deleteElementType = async (id: string) => {
  const res = await request<ApiResponse>(`${URL_ELEMENT_TYPE}/${id}`, {
    method: 'DELETE',
  });
  await Promise.all([
    mutate(`${URL_ELEMENT_TYPE}/${id}`),
    mutate(
      (key) => typeof key === 'string' && key.startsWith(URL_ELEMENT_TYPE)
    ),
  ]);
  return res;
};
