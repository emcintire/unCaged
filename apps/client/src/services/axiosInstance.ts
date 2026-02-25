import Axios, {
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosRequestHeaders,
  type InternalAxiosRequestConfig,
  type Method,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import { env } from '@/config';
import { STORAGE_KEYS } from '@/constants';
import { logger } from '@/utils';

export type UnwrapApiEnvelope<T> = T extends { data: infer D } ? D : T;

export type AuthRequestConfig = InternalAxiosRequestConfig & {
  skipRefresh?: boolean;
  _retry?: boolean;
};

type ExtendedAxiosRequestConfig = AxiosRequestConfig & {
  skipRefresh?: boolean;
  _retry?: boolean;
};

/**
 * Endpoints that should never trigger a token refresh on 401.
 * Add any auth endpoints here whose 401 means "bad credentials", not "expired token".
 */
const SKIP_REFRESH_ENDPOINTS: Array<string> = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/users/changePassword',
];

const isSkipRefreshEndpoint = (url: string | undefined): boolean =>
  SKIP_REFRESH_ENDPOINTS.some(endpoint => url?.includes(endpoint));

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

const setAuthorizationHeader = (
  config: { headers?: InternalAxiosRequestConfig['headers']},
  token: string,
) => {
  const headers = AxiosHeaders.from(config.headers ?? {});
  headers.set('Authorization', `Bearer ${token}`);
  config.headers = headers;
};

export const AXIOS_INSTANCE = Axios.create({
  baseURL: env.apiBaseUrl,
});

/**
 * Request interceptor: attach access token via Authorization Bearer token
 */
AXIOS_INSTANCE.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const cfg = config as AuthRequestConfig;

  const token = await getAccessToken();
  if (token) {
    setAuthorizationHeader(cfg, token);
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

  const res = await AXIOS_INSTANCE.post<RefreshResponse>(
    '/api/auth/refresh',
    { refreshToken },
    { skipRefresh: true } as ExtendedAxiosRequestConfig,
  );

  const { accessToken, refreshToken: newRefreshToken } = res.data ?? {};
  if (!accessToken || !newRefreshToken) throw new Error('Invalid refresh response');

  await setTokens(accessToken, newRefreshToken);
  return res.data;
}

/**
 * Response interceptor:
 * - On 401: attempt one refresh + retry original request (unless skipRefresh or a skip-refresh endpoint)
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

    const { response: { status } } = error;
    const cfg = (error.config ?? {}) as AuthRequestConfig;

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
    if (status === 401 && !cfg._retry && !cfg.skipRefresh && !isSkipRefreshEndpoint(cfg.url)) {
      cfg._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshTokens().finally(() => {
            refreshPromise = null;
          });
        }

        const refreshed = await refreshPromise;

        // Retry original request with fresh access token
        setAuthorizationHeader(cfg, refreshed.accessToken);

        return AXIOS_INSTANCE.request(cfg);
      } catch (refreshErr) {
        await clearTokens();
        onUnauthorizedCallback?.();
        return Promise.reject(refreshErr);
      }
    }

    // If we got a 401 and didn't refresh (auth endpoints or skipRefresh), treat as signed out
    if (status === 401 && !isSkipRefreshEndpoint(cfg.url)) {
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