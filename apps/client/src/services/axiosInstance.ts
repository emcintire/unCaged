import Axios, { type AxiosRequestConfig, type Method } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { env } from '@/config';
import { STORAGE_KEYS } from '@/constants';

export type UnwrapApiEnvelope<T> = T extends { data: infer D } ? D : T;

let onUnauthorizedCallback: (() => void) | null = null;

export function setOnUnauthorized(callback: (() => void) | null) {
  onUnauthorizedCallback = callback;
}

export const AXIOS_INSTANCE = Axios.create({
  baseURL: env.apiBaseUrl,
});

AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any)['x-auth-token'] = token;
  }
  return config;
});

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(JSON.stringify(error));
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
      if (typeof apiMessage === 'string' && apiMessage.length > 0) {
        error.message = apiMessage;
      }

      if (error.response.status === 401 && onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    } else if (env.isDev) {
      console.warn('Network Error:', error.config?.url, error.message);
    }

    return Promise.reject(error);
  },
);

// Internal helper that keeps your React Query cancellation behavior
const axiosRequest = <T>(config: AxiosRequestConfig): Promise<UnwrapApiEnvelope<T>> => {
  const source = Axios.CancelToken.source();

  const promise = AXIOS_INSTANCE({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => {
    if (typeof data === 'object' && data !== null && 'data' in data) {
      return (data as { data: UnwrapApiEnvelope<T> }).data;
    }
    return data as UnwrapApiEnvelope<T>;
  });

  (promise as Promise<UnwrapApiEnvelope<T>> & { cancel?: () => void }).cancel = () => {
    source.cancel('Request cancelled by React Query');
  };

  return promise;
};

function headersToObject(h?: RequestInit['headers']): Record<string, string> {
  if (!h) return {};
  if (h instanceof Headers) return Object.fromEntries(h.entries());
  if (Array.isArray(h)) return Object.fromEntries(h);
  return h as Record<string, string>;
}

function tryParseJson(input: string) {
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}

export const axiosInstance = <T>(url: string, options?: RequestInit): Promise<UnwrapApiEnvelope<T>> => {
  const method = ((options?.method ?? 'GET').toLowerCase() as Method);

  const headers = headersToObject(options?.headers);

  const data =
    typeof options?.body === 'string'
      ? tryParseJson(options.body)
      : options?.body;

  const config: AxiosRequestConfig = {
    url,
    method,
    headers,
    ...(data !== undefined ? { data } : {}),
    ...(options?.signal ? { signal: options.signal } : {}),
  };

  return axiosRequest<T>(config);
};