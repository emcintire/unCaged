import * as SecureStore from 'expo-secure-store';

import { STORAGE_KEYS } from '../constants';
import { queryClient } from '../services/queryClient';

export const clearCache = async (): Promise<void> => {
  queryClient.clear();
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN),
    SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_REFRESH_TOKEN),
  ]);
};
