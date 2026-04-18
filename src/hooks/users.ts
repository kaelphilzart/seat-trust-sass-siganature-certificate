import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { IUser, ICreateUser, IUpdateUser } from '@/types/user';
import { endpoints, request } from '@/utils/helper-server';

// base URL API
const URL_USER = endpoints.users;

// SWR options
const options = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ===========================
// GET ALL USERS
// ===========================
export function useGetAllUsers() {
  const { data, error, isLoading, isValidating } = useSWR<{ data: IUser[] }>(
    URL_USER,
    (url) => request<{ data: IUser[] }>(url),
    options
  );

  const memoized = useMemo(() => ({
    users: (data?.data || []) as IUser[],
    usersLoading: isLoading,
    usersIsValidating: isValidating,
    usersError: error,
  }), [data, isLoading, isValidating, error]);

  return memoized;
}

// ===========================
// CREATE USER
// ===========================
export async function createUser(data: ICreateUser) {
  try {
    const res = await request<IUser>(URL_USER, { method: 'POST', body: data });

    // invalidate cache
    mutate((key) => typeof key === 'string' && key.startsWith(URL_USER));

    return res;
  } catch (error: any) {
    console.error('Error saat membuat user:', error.message || error);
    return false;
  }
}

// ===========================
// UPDATE USER (PATCH partial)
// ===========================
export async function editUser(id: string, data: Partial<IUpdateUser>) {
  try {
    const res = await request<IUser>(`${URL_USER}/${id}`, { method: 'PATCH', body: data });

    // update cache lokal SWR
    mutate(
      URL_USER,
      (existing: any) => {
        if (!existing?.data) return { data: [res] };
        return {
          ...existing,
          data: existing.data.map((item: IUser) => (item.id === id ? { ...item, ...data } : item)),
        };
      },
      false
    );

    // invalidate semua cache user
    mutate((key) => typeof key === 'string' && key.startsWith(URL_USER));

    return res;
  } catch (error: any) {
    console.error('Error saat mengupdate user:', error.message || error);
    return false;
  }
}

// ===========================
// DELETE USER
// ===========================
export async function deleteUser(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${URL_USER}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      let message = 'Terjadi kesalahan saat menghapus user.';
      try {
        const json = await res.json();
        message = json.message || message;
      } catch {
        // kalau ga ada JSON, tetap pakai default message
      }
      return { success: false, message };
    }

    // Invalidate SWR cache
    await Promise.all([
      mutate(`${URL_USER}/${id}`),
      mutate((key) => typeof key === 'string' && key.startsWith(URL_USER)),
    ]);

    // DELETE sukses, 204 No Content → return success
    return { success: true };
  } catch (error: any) {
    console.error('Error saat menghapus user:', error?.message || error);
    return {
      success: false,
      message: error?.message || 'Terjadi kesalahan saat menghapus user.',
    };
  }
}