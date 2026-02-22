export const STORAGE_KEYS = {
  AUTH_CODE: 'code',
  AUTH_EMAIL: 'email',
  AUTH_TOKEN: 'token',
  AUTH_REFRESH_TOKEN: 'refreshToken',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 4000,
} as const;

export const genres = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'War',
] as const;