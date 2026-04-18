import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { endpoints, request, requestFile } from '@/utils/helper-server';
import { ICreateOrganizationAsset, IOrganizationAsset, IUpdateOrganizationAsset } from '@/types/organization';
import { ApiResponse } from '@/types/request';

// base URL API
const URL_ORGANIZATION_ASSETS = endpoints.Organization.asset;


// SWR options
const options = {
    revalidateIfStale: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

// ===========================
// GET ALL 
// ===========================
export function useGetAllOrganizationAssets(organizationId?: string) {
    const { data, error, isLoading, isValidating } = useSWR<{ data: IOrganizationAsset[] }>(
        organizationId ? `${URL_ORGANIZATION_ASSETS}/${organizationId}` : URL_ORGANIZATION_ASSETS,
        (url) => request<{ data: IOrganizationAsset[] }>(url),
        options
    );
    const memoized = useMemo(() => ({
        OrganizationAssets: (data?.data || []) as IOrganizationAsset[],
        OrganizationAssetsLoading: isLoading,
        OrganizationAssetsIsValidating: isValidating,
        OrganizationAssetsError: error,
    }), [data, isLoading, isValidating, error]);

    return memoized;
}

// GET ONE
export function useGetOneOrganizationAsset(id?: string) {
    const { data, error, isLoading } = useSWR<IOrganizationAsset>(
        id ? `${URL_ORGANIZATION_ASSETS}/${id}` : null,
        (url: string) => request<IOrganizationAsset>(url)
    );

    const memoized = useMemo(() => ({
        OrganizationAsset: data || null,
        OrganizationAssetLoading: isLoading,
        OrganizationAssetError: !!error,
    }), [data, isLoading, error]);

    return memoized;
}

// ===========================
// CREATE ORGANIZATION ASSET
// ===========================
export async function createOrganizationAsset(
    data: ICreateOrganizationAsset & { file: File }
) {
    const formData = new FormData();

    formData.append('name', data.name ?? '');

    if (data.type) {
        formData.append('type', data.type); // 'IMAGE' | 'FONT' | 'LOGO'
    }
    formData.append('file', data.file);

    const res = await requestFile<ApiResponse<ICreateOrganizationAsset>>(URL_ORGANIZATION_ASSETS, {
        method: 'POST',
        body: formData,
    });

    await mutate((key) =>
        typeof key === 'string' && key.startsWith(URL_ORGANIZATION_ASSETS)
    );

    return {
        success: true,
        data: res.data,
        message: res.message,
    };
}

// ===========================
// PATCH ELEMENT TYPE
// ===========================
export async function editOrganizationAsset(
    id: string,
    data: IUpdateOrganizationAsset
): Promise<{ success: boolean; data?: IOrganizationAsset; message: string }> {
    try {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (key === 'file' && value instanceof File) {
                formData.append('file', value);
                return;
            }
            if (key === 'file_path') return;

            formData.append(key, String(value));
        });

        const res = await requestFile<ApiResponse<IOrganizationAsset>>(
            `${URL_ORGANIZATION_ASSETS}/${id}`,
            {
                method: 'PATCH',
                body: formData,
            }
        );

        await Promise.all([
            mutate(`${URL_ORGANIZATION_ASSETS}/${id}`),
            mutate((key) => typeof key === 'string' && key.startsWith(URL_ORGANIZATION_ASSETS)),
        ]);

        return {
            success: true,
            data: res.data,
            message: res.message || 'Berhasil update',
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Error update Element Type',
        };
    }
}
// ===========================
// DELETE ORGANIZATION USER
// ===========================
export const deleteOrganizationAsset = async (id: string) => {
    const res = await request<ApiResponse>(
        `${URL_ORGANIZATION_ASSETS}/${id}`,
        { method: 'DELETE' }
    );
    await mutate((key) => typeof key === 'string' && key.startsWith(URL_ORGANIZATION_ASSETS));
    return res;
};