import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { endpoints, request } from '@/utils/helper-server';
import { ICreateOrganization, IOrganization, IUpdateOrganization } from '@/types/organization';
import { ICreateSubscription } from '@/types/subscription';
import { ApiResponse } from '@/types/request';
import { SWR_KEYS } from '@/lib/swrKeys';

// base URL API
const URL_SUBSCRIPTION = endpoints.subscription.base;

// SWR options
const options = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ===========================
// GET ALL ORGANIZATIONS
// ===========================
export function useGetAllOrganizations() {
  const { data, error, isLoading, isValidating } = useSWR<{ data: IOrganization[] }>(
    SWR_KEYS.organizations(),
    (url) => request<{ data: IOrganization[] }>(url),
    options
  );

  const memoized = useMemo(() => ({
    organizations: (data?.data || []) as IOrganization[],
    organizationsLoading: isLoading,
    organizationsIsValidating: isValidating,
    organizationsError: error,
  }), [data, isLoading, isValidating, error]);

  return memoized;
}

// GET ONE
export function useGetOneOrganization(id?: string) {
  const { data, error, isLoading } = useSWR<IOrganization>(
    id ? SWR_KEYS.organizationDetail(id) : null,
    (url: string) => request<IOrganization>(url)
  );

  const memoized = useMemo(() => ({
    organizationOne: data || null,
    organizationOneLoading: isLoading,
    organizationOneError: !!error,
  }), [data, isLoading, error]);

  return memoized;
}

// ===========================
// CREATE ORGANIZATION
// ===========================
export async function createOrganization(
  data: ICreateOrganization,
  subscription?: ICreateSubscription
) {
  try {
    // 1️⃣ create organization
    const res = await request<{ message: string; data: IOrganization }>(
      SWR_KEYS.organizations(),
      {
        method: 'POST',
        body: data,
      }
    );

    const organization = res.data;

    if (!organization?.id) {
      throw new Error('Organization gagal dibuat, organization_id tidak tersedia');
    }
    if (subscription) {
      await request<ICreateSubscription>(
        `${URL_SUBSCRIPTION}/${organization.id}`,
        {
          method: 'POST',
          body: subscription,
        }
      );
    }
    await mutate(SWR_KEYS.organizations());

    return organization;

  } catch (error: any) {
    console.error('Error saat membuat organization:', error.message || error);
    return false;
  }
}
// ===========================
// UPDATE ORGANIZATION
// ===========================
export const editOrganization = async (
  id: string,
  data: Partial<IUpdateOrganization>
) => {

  const res = await request<ApiResponse<IOrganization>>(
    SWR_KEYS.organizationDetail(id),
    {
      method: 'PATCH',
      body: data,
    }
  );

  await Promise.all([
    mutate(SWR_KEYS.organizationDetail(id), undefined, { revalidate: true }),
    mutate(SWR_KEYS.organizations(), undefined, { revalidate: true }),
  ]);

  return res;
};

// ===========================
// DELETE ORGANIZATION
// ===========================
export const deleteOrganization = async (id: string) => {
  const res = await request<ApiResponse>(
    SWR_KEYS.organizationDetail(id),
    { method: 'DELETE' }
  );
  await Promise.all([
    mutate(SWR_KEYS.organizationDetail(id)),
    mutate(SWR_KEYS.organizations()),
  ]);

  return res;
};