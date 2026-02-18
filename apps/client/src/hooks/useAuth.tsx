import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useQueryClient } from '@tanstack/react-query';
import { STORAGE_KEYS } from '@/constants';
import { setOnUnauthorized } from '@/services/zodiosClient';

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
    // Update state synchronously first so navigation switches immediately
    setIsAuthenticated(false);
    queryClient.clear();
    // Delete token in background — no need to block UI on this
    void SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  }, [queryClient]);

  const signIn = useCallback(async (token: string) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
        setIsAuthenticated(token != null);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Register the 401 handler so the interceptor can trigger sign out
  useEffect(() => {
    setOnUnauthorized(signOut);
    return () => setOnUnauthorized(null);
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
