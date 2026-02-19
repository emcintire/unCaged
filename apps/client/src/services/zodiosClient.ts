import { mergeApis, Zodios } from '@zodios/core';
import * as SecureStore from 'expo-secure-store';
import { env } from '@/config';
import { STORAGE_KEYS } from '@/constants';
import { movieApi, userApi, reviewApi, quoteApi } from './api';

let onUnauthorizedCallback: (() => void) | null = null;

export function setOnUnauthorized(callback: (() => void) | null) {
  onUnauthorizedCallback = callback;
}

const apiContract = mergeApis({
  'users': userApi,
  'movies': movieApi,
  'reviews': reviewApi,
  'quotes': quoteApi,
});

const baseClient = new Zodios(env.apiBaseUrl, apiContract);

baseClient.axios.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

baseClient.axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (env.isDev) {
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response.status,
          data: error.response.data,
        });
      }

      const data = error.response.data;
      const apiMessage = typeof data === 'string' ? data : data?.message;
      if (apiMessage) {
        error.message = apiMessage;
      }

      if (error.response.status === 401 && onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    } else if (env.isDev) {
      console.warn('Network Error:', error.config?.url, error.message);
    }

    return Promise.reject(error);
  }
);

export const zodiosClient = baseClient;

export type ApiClient = typeof zodiosClient;
