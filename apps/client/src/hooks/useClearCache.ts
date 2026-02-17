import * as SecureStore from 'expo-secure-store';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { STORAGE_KEYS } from '../constants';

export const useClearCache = () => {
  const queryClient = useQueryClient();
  return useCallback(async () => {
    queryClient.clear();
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  }, [queryClient]);
};