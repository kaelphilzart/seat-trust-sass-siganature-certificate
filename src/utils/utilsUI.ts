export function handleAsync<T>(fn: () => Promise<T>) {
  return async () => {
    try {
      await fn();
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Terjadi kesalahan',
      };
    }
  };
}
