// apps/client/src/services/axiosInstance.ts
import Axios, {
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
  type InternalAxiosRequestConfig,
  type Method,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import { env } from '@/config';
import { STORAGE_KEYS } from '@/constants';
import { logger } from '@/utils/logger';

/**
 * If your API often returns an envelope like:
 *   { data: <payload>, status: number }
 * this unwrap makes TanStack Query results be the payload (no data.data).
 */
export type UnwrapApiEnvelope<T> = T extends { data: infer D } ? D : T;

// ----- Axios config flags -----
// We keep these on InternalAxiosRequestConfig so interceptors are happy with Axios v1 typings.
export type AuthRequestConfig = InternalAxiosRequestConfig & {
  skipAuth?: boolean;
  skipRefresh?: boolean;
  _retry?: boolean;
};

let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorized = (callback: (() => void) | null) => {
  onUnauthorizedCallback = callback;
}

const getAccessToken = async () => {
  return SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
}

const getRefreshToken = async () => {
  return SecureStore.getItemAsync(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
}

const setTokens = async (accessToken: string, refreshToken?: string) => {
  await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, accessToken);
  if (refreshToken) {
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_REFRESH_TOKEN, refreshToken);
  }
}

const clearTokens = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN),
    SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_REFRESH_TOKEN),
  ]);
}

export const AXIOS_INSTANCE = Axios.create({
  baseURL: env.apiBaseUrl,
});

/**
 * Request interceptor: attach access token via x-auth-token
 * IMPORTANT: return InternalAxiosRequestConfig, not AxiosRequestConfig, to satisfy Axios v1 types.
 */
AXIOS_INSTANCE.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const cfg = config as AuthRequestConfig;

  if (cfg.skipAuth) return cfg;

  const token = await getAccessToken();
  if (token) {
    // Axios v1 headers can be AxiosHeaders; safest is to treat as unknown and assign.
    cfg.headers = cfg.headers ?? ({} as any);
    (cfg.headers as any)['x-auth-token'] = token;
  }

  return cfg;
});

/**
 * Single-flight refresh: if multiple requests 401 at once, only one refresh request is made.
 */
type RefreshResponse = { accessToken: string; refreshToken: string; };
let refreshPromise: Promise<RefreshResponse> | null = null;

const refreshTokens = async (): Promise<RefreshResponse> => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error('Missing refresh token');

  // skipAuth: don't attach x-auth-token on refresh
  // skipRefresh: don't attempt refresh again if refresh itself 401s
  const res = await AXIOS_INSTANCE.post<RefreshResponse>(
    '/api/auth/refresh',
    { refreshToken },
    { skipAuth: true, skipRefresh: true } as any,
  );

  const { accessToken, refreshToken: newRefreshToken } = res.data ?? {};
  if (!accessToken || !newRefreshToken) throw new Error('Invalid refresh response');

  await setTokens(accessToken, newRefreshToken);
  return res.data;
}

/**
 * Response interceptor:
 * - On 401: attempt one refresh + retry original request (unless skipRefresh/skipAuth)
 * - If refresh fails: clear tokens + call onUnauthorizedCallback
 */
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (Axios.isCancel(error) || error?.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    if (!error?.response) {
      logger.error('Network error or no response received:', {
        url: error?.config?.url,
        message: error?.message,
      });
      return Promise.reject(error);
    }

    const status: number = error.response.status;
    const cfg: AuthRequestConfig = (error.config ?? {}) as AuthRequestConfig;

    logger.error('API Error:', {
      url: cfg.url,
      method: cfg.method,
      status,
      data: error.response.data,
    });

    const respData = error.response.data;
    const apiMessage = typeof respData === 'string' ? respData : respData?.message;
    if (typeof apiMessage === 'string' && apiMessage.length > 0) {
      error.message = apiMessage;
    }

    // Attempt refresh on 401 (only once) unless explicitly disabled.
    // We also avoid trying to refresh requests that were marked skipAuth (login/register/etc.).
    if (status === 401 && !cfg._retry && !cfg.skipRefresh && !cfg.skipAuth) {
      cfg._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshTokens().finally(() => {
            refreshPromise = null;
          });
        }

        const refreshed = await refreshPromise;

        // Retry original request with fresh access token
        cfg.headers = cfg.headers ?? ({} as any);
        (cfg.headers as any)['x-auth-token'] = refreshed.accessToken;

        return AXIOS_INSTANCE.request(cfg);
      } catch (refreshErr) {
        await clearTokens();
        onUnauthorizedCallback?.();
        return Promise.reject(refreshErr);
      }
    }

    // If we got a 401 and didn't refresh (auth endpoints or skipRefresh), treat as signed out
    if (status === 401) {
      await clearTokens();
      onUnauthorizedCallback?.();
    }

    return Promise.reject(error);
  },
);

const isApiEnvelope = (value: unknown): value is { data: unknown; status?: number } => {
  if (typeof value !== 'object' || value === null) return false;
  if (!('data' in value)) return false;
  return true;
}

const axiosRequest = <T>(config: AxiosRequestConfig): Promise<UnwrapApiEnvelope<T>> => {
  const source = Axios.CancelToken.source();

  const promise = AXIOS_INSTANCE({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => {
    if (isApiEnvelope(data)) {
      return data.data as UnwrapApiEnvelope<T>;
    }
    return data as UnwrapApiEnvelope<T>;
  });

  // Attach cancel so Tanstack Query can cancel in-flight requests
  (promise as Promise<UnwrapApiEnvelope<T>> & { cancel?: () => void }).cancel = () => {
    source.cancel('Request cancelled by Tanstack Query');
  };

  return promise;
};

const headersToObject = (headers?: RequestInit['headers']): Record<string, string> => {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return headers as Record<string, string>;
}

const tryParseJson = (input: string) => {
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}

export const axiosInstance = <T>(url: string, options?: RequestInit): Promise<UnwrapApiEnvelope<T>> => {
  const method = (options?.method ?? 'GET').toLowerCase() as Method;
  const headers = headersToObject(options?.headers) as AxiosRequestHeaders;

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