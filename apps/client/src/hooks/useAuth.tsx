import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useQueryClient } from '@tanstack/react-query';
import { STORAGE_KEYS } from '@/constants';
import { setOnUnauthorized, useLogout } from '@/services';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (accessToken: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const deleteKeys = () => {
  void SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  void SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const logoutMutation = useLogout();

  const signOut = useCallback(async () => {
    setIsAuthenticated(false);
    queryClient.clear();
    deleteKeys();
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
    if (!refreshToken) { return; }

    logoutMutation.mutate({ data: { refreshToken } });
  }, [logoutMutation, queryClient]);

  const signIn = useCallback(async (accessToken: string, refreshToken: string) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, accessToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_REFRESH_TOKEN, refreshToken);
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
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
        deleteKeys();
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
