// utils/fetcher.ts
export const fetcher = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Something went wrong');
  }

  // Kalau status 204 (DELETE), nggak ada body
  if (res.status === 204) return null;

  return res.json();
};