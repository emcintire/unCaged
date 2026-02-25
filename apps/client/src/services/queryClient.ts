import {
  type Mutation,
  MutationCache,
  type Query,
  QueryCache,
  QueryClient,
} from '@tanstack/react-query';

import { logger, showErrorToast } from '@/utils';

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string' && error.length > 0) return error;

  const maybeError = error as {
    message?: string;
    response?: { data?: { message?: string } | string };
  };

  const responseData = maybeError?.response?.data;
  if (typeof responseData === 'string' && responseData.length > 0) return responseData;
  if (typeof responseData === 'object' && responseData && 'message' in responseData) {
    const { message } = (responseData as { message?: string });
    if (typeof message === 'string' && message.length > 0) return message;
  }

  if (typeof maybeError?.message === 'string' && maybeError.message.length > 0) {
    return maybeError.message;
  }

  return 'Something went wrong';
};

const logQueryError = (
  error: unknown,
  query: Query<unknown, unknown, unknown, ReadonlyArray<unknown>>,
) => {
  logger.error('Query failed', error, undefined, {
    context: 'react-query',
    data: {
      queryKey: query.queryKey,
    },
  });
};

const logMutationError = (
  error: unknown,
  mutation: Mutation<unknown, unknown, unknown, unknown>,
) => {
  logger.error('Mutation failed', error, undefined, {
    context: 'react-query',
    data: {
      mutationKey: mutation.options.mutationKey,
      variables: mutation.state.variables,
    },
  });
};

const shouldRetry = (failureCount: number, error: unknown): boolean => {
  const status = (error as { response?: { status?: number } })?.response?.status;
  // Never retry auth or permission failures — the 401 interceptor handles signOut
  if (status === 401 || status === 403 || status === 404) return false;
  return failureCount < 1;
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      logQueryError(error, query);
      if (query.state.fetchStatus !== 'idle') {
        showErrorToast(getErrorMessage(error));
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      logMutationError(error, mutation);

      if (typeof mutation.options.onError === 'function') {
        return;
      }

      showErrorToast(getErrorMessage(error));
    },
  }),
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error) => shouldRetry(failureCount, error),
    },
  },
});
