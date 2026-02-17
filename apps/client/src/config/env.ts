import Constants from 'expo-constants';

/**
 * Environment configuration module
 * Centralized access to environment variables
 */
export const env = {
  /**
   * Base URL for API requests
   * Defaults to production API if not configured
   */
  get apiBaseUrl(): string {
    const baseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
    return baseUrl;
  },

  /**
   * Check if running in development mode
   */
  get isDev(): boolean {
    return __DEV__;
  },

  /**
   * Check if running in production mode
   */
  get isProd(): boolean {
    return !__DEV__;
  },
} as const;

export type Env = typeof env;
