import { useCallback } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';

export function useOptimisticUpdate() {
  const queryClient = useQueryClient();

  return useCallback(async <T>(
    queryKey: QueryKey,
    update: (old: T) => T,
    mutate: () => Promise<unknown>,
  ) => {
    await queryClient.cancelQueries({ queryKey });
    const prev = queryClient.getQueryData<T>(queryKey);
    queryClient.setQueryData<T>(queryKey, (old) => old ? update(old) : old);
    try {
      await mutate();
    } catch {
      queryClient.setQueryData(queryKey, prev);
    } finally {
      void queryClient.invalidateQueries({ queryKey });
    }
  }, [queryClient]);
}
