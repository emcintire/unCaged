import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useQueryClient } from '@tanstack/react-query';
import { STORAGE_KEYS } from '@/constants';
import { setOnUnauthorized } from '@/services';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const signOut = useCallback(async () => {
    setIsAuthenticated(false);
    queryClient.clear();
    void SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  }, [queryClient]);

  const signIn = useCallback(async (token: string) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      setOnUnauthorized(null);
      try {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
        if (!token) {
          setIsAuthenticated(false);
          return;
        }
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
        void SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      } finally {
        setIsLoading(false);
        setOnUnauthorized(signOut);
      }
    }

    checkAuth();
  }, [signOut]);

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, signIn, signOut }),
    [isAuthenticated, isLoading, signIn, signOut]
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
