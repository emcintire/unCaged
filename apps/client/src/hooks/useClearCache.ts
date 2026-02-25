import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { useCallback } from 'react';

import { STORAGE_KEYS } from '../constants';

export const useClearCache = () => {
  const queryClient = useQueryClient();
  return useCallback(async () => {
    queryClient.clear();
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_REFRESH_TOKEN),
    ]);
  }, [queryClient]);
};