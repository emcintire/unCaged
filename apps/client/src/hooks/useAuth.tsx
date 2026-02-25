import * as SecureStore from 'expo-secure-store';
import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { STORAGE_KEYS } from '@/constants';
import { setOnUnauthorized, useLogout } from '@/services';
import { clearCache } from '@/utils';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (accessToken: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logoutMutation = useLogout();

  const signOut = useCallback(async () => {
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
    setIsAuthenticated(false);
    void clearCache();

    if (refreshToken) {
      logoutMutation.mutate({ data: { refreshToken } });
    }
  }, [logoutMutation]);

  const signIn = useCallback(async (accessToken: string, refreshToken: string) => {
    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, accessToken),
      SecureStore.setItemAsync(STORAGE_KEYS.AUTH_REFRESH_TOKEN, refreshToken),
    ]);
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
        setIsAuthenticated(token != null);
      } catch {
        setIsAuthenticated(false);
        void clearCache();
      } finally {
        setIsLoading(false);
        setOnUnauthorized(signOut);
      }
    };

    checkAuth();
  }, [signOut]);

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, signIn, signOut }),
    [isAuthenticated, isLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
