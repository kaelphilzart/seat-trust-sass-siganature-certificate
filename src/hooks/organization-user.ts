import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import {
  IOrganizationUser,
  ICreateOrganizationUser,
  IUpdateOrganizationUser,
} from '@/types/organization-user';
import { ICreateUser } from '@/types/user';
import { createUser } from '@/hooks/users';
import { endpoints, request } from '@/utils/helper-server';
import { ApiResponse } from '@/types/request';

// base URL API
const URL_ORGANIZATION_USER = endpoints.Organization.user;
// SWR options
const options = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ===========================
// GET ORGANIAZATION USERS
// ===========================
export function useGetAllOrganizationUsers(organizationId?: string) {
  const { data, error, isLoading, isValidating } = useSWR<{
    data: IOrganizationUser[];
  }>(
    organizationId
      ? `${URL_ORGANIZATION_USER}/${organizationId}`
      : URL_ORGANIZATION_USER,
    (url) => request<{ data: IOrganizationUser[] }>(url),
    options
  );
  const memoized = useMemo(
    () => ({
      organizationUsers: (data?.data || []) as IOrganizationUser[],
      organizationUsersLoading: isLoading,
      organizationUsersIsValidating: isValidating,
      organizationUsersError: error,
    }),
    [data, isLoading, isValidating, error]
  );

  return memoized;
}

// ===========================
// CREATE ORGAniZATION USER
// ===========================
export async function createOrganizationUser(
  orgId: string,
  userData: ICreateUser,
  organizationData: ICreateOrganizationUser
) {
  try {
    const user = await createUser(userData);
    if (!user || !user.id) {
      return {
        success: false,
        message: 'User gagal dibuat, user_id tidak tersedia',
      };
    }
    const res = await request<ApiResponse<IOrganizationUser>>(
      `${URL_ORGANIZATION_USER}/${orgId}`,
      {
        method: 'POST',
        body: {
          role: organizationData.role,
          user_id: user.id,
        },
      }
    );
    const organizationUser = res.data;
    if (!organizationUser?.id) {
      return {
        success: false,
        message: 'Organization user gagal dibuat',
      };
    }
    await mutate(`${URL_ORGANIZATION_USER}/${orgId}`);
    return res;
  } catch (error: unknown) {
    throw error;
  }
}

// ===========================
// PATCH ORGANIZATION USER
// ===========================
export const editOrganizationUser = async (
  id: string,
  data: Partial<IUpdateOrganizationUser>
) => {
  const res = await request<ApiResponse<IOrganizationUser>>(
    `${URL_ORGANIZATION_USER}/${id}`,
    {
      method: 'PATCH',
      body: data,
    }
  );

  await Promise.all([
    mutate(`${URL_ORGANIZATION_USER}/${id}`, undefined, { revalidate: true }),
    mutate(
      (key) => typeof key === 'string' && key.startsWith(URL_ORGANIZATION_USER),
      undefined,
      { revalidate: true }
    ),
  ]);

  return res;
};
// ===========================
// DELETE ORGANIZATION USER
// ===========================
export const deleteOrganizationUser = async (id: string) => {
  const res = await request<ApiResponse>(`${URL_ORGANIZATION_USER}/${id}`, {
    method: 'DELETE',
  });
  await Promise.all([
    mutate(`${URL_ORGANIZATION_USER}/${id}`),
    mutate(
      (key) => typeof key === 'string' && key.startsWith(URL_ORGANIZATION_USER)
    ),
  ]);
  return res;
};
