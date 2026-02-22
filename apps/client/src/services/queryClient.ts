import { QueryClient } from '@tanstack/react-query';

const shouldRetry = (failureCount: number, error: unknown): boolean => {
  const status = (error as { response?: { status?: number } })?.response?.status;
  // Never retry auth or permission failures — the 401 interceptor handles signOut
  if (status === 401 || status === 403 || status === 404) return false;
  return failureCount < 1;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error) => shouldRetry(failureCount, error),
    },
  },
});
