import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { endpoints, request, requestFile } from '@/utils/helper-server';
import { ITemplate, ICreateTemplate } from '@/types/template';
import { ApiResponse } from '@/types/request';

// base URL API
const URL_TEMPLATE = endpoints.template.base;
const URL_TEMPLATE_DETAIL = endpoints.template.detail;


// SWR options
const options = {
    revalidateIfStale: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

// ===========================
// GET ALL TEMPLATES
// ===========================
export function useGetAllTemplate(organizationId?: string) {
    const { data, error, isLoading, isValidating } = useSWR<{ data: ITemplate[] }>(
        organizationId ? `${URL_TEMPLATE}/${organizationId}` : URL_TEMPLATE,
        (url) => request<{ data: ITemplate[] }>(url),
        options
    );
    const memoized = useMemo(() => ({
        templates: (data?.data || []) as ITemplate[],
        templatesLoading: isLoading,
        templatesIsValidating: isValidating,
        templatesError: error,
    }), [data, isLoading, isValidating, error]);

    return memoized;
}

// GET ONE
export function useGetOneTemplate(id?: string) {
    const { data, error, isLoading } = useSWR<ITemplate>(
        id ? `${URL_TEMPLATE_DETAIL}/${id}` : null,
        (url: string) => request<ITemplate>(url)
    );

    const memoized = useMemo(() => ({
        templateOne: data || null,
        templateOneLoading: isLoading,
        templateOneError: !!error,
    }), [data, isLoading, error]);

    return memoized;
}

// ===========================
// CREATE ORGAniZATION USER
// ===========================
export async function createTemplate(
    data: { name: string; file: File }
) {
    try {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('file', data.file);

        const res = await requestFile<ApiResponse<ICreateTemplate>>(URL_TEMPLATE, {
            method: 'POST',
            body: formData,
        });

        await mutate(URL_TEMPLATE);

        return {
            success: true,
            data: res.data,
            message: res.message,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Error create template',
        };
    }
}

// ===========================
// PATCH ORGANIZATION USER
// ===========================
// export const editOrganizationUser = async (
//     id: string,
//     data: Partial<IUpdateOrganizationUser>
// ) => {

//     const res = await request<ApiResponse<IOrganizationUser>>(
//         `${URL_ORGANIZATION_USER}/${id}`,
//         {
//             method: "PATCH",
//             body: data,
//         }
//     );

//     await Promise.all([
//         mutate(`${URL_ORGANIZATION_USER}/${id}`, undefined, { revalidate: true }),
//         mutate(
//             (key) =>
//                 typeof key === "string" &&
//                 key.startsWith(URL_ORGANIZATION_USER),
//             undefined,
//             { revalidate: true }
//         ),
//     ]);

//     return res;
// };
// ===========================
// DELETE ORGANIZATION USER
// ===========================
export const deleteTemplate = async (id: string) => {
    const res = await request<ApiResponse>(
        `${URL_TEMPLATE}/${id}`,
        { method: 'DELETE' }
    );
    await Promise.all([
        mutate(`${URL_TEMPLATE}/${id}`),
        mutate((key) => typeof key === 'string' && key.startsWith(URL_TEMPLATE)),
    ]);
    return res;
};