import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { endpoints, request } from '@/utils/helper-server';
import { IParticipant, ICreateParticipant } from '@/types/participant';
import { ApiResponse } from '@/types/request';

// base URL API
const URL_PARTICIPANT = endpoints.participant;

// SWR options
const options = {
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ===========================
// GET ALL
// ===========================
export function useGetAllParticipants(batchId?: string) {
  const { data, error, isLoading, isValidating } = useSWR<{
    data: IParticipant[];
  }>(
    batchId ? `${URL_PARTICIPANT}/${batchId}` : URL_PARTICIPANT,
    (url) => request<{ data: IParticipant[] }>(url),
    options
  );
  const memoized = useMemo(
    () => ({
      participants: (data?.data || []) as IParticipant[],
      participantsLoading: isLoading,
      participantsIsValidating: isValidating,
      participantsError: error,
    }),
    [data, isLoading, isValidating, error]
  );

  return memoized;
}

// ===========================
// GET ONE BY ID
// ===========================
export function useGetOneParticipant(id?: string) {
  const { data, error, isLoading } = useSWR<IParticipant>(
    id ? `${URL_PARTICIPANT}/${id}` : null,
    (url: string) => request<IParticipant>(url)
  );

  const memoized = useMemo(
    () => ({
      participant: data || null,
      participantLoading: isLoading,
      participantError: !!error,
    }),
    [data, isLoading, error]
  );

  return memoized;
}

// ===========================
// CREATE BULK
// ===========================
export async function createBulkParticipants(data: ICreateParticipant[]) {
  try {
    const res = await request<ApiResponse<unknown>>(URL_PARTICIPANT, {
      method: 'POST',
      body: data,
    });
    await mutate(
      (key) => typeof key === 'string' && key.includes('participant')
    );

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
export async function deleteBulkParticipants(ids: string[]) {
  try {
    const res = await request<ApiResponse<unknown>>(URL_PARTICIPANT, {
      method: 'DELETE',
      body: { ids },
    });
    await mutate(
      (key) => typeof key === 'string' && key.includes('participant')
    );
    return {
      success: true,
      message: res.message,
    };
  } catch (error: unknown) {
    throw error;
  }
}
