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

// Profile pictures stored as local assets (assets/imgs/1.png through 6.png).
// The index stored in user.image is 1-based; PROFILE_PICS is 0-based.
export const PROFILE_PICS = [
  require('@/assets/imgs/1.png'),
  require('@/assets/imgs/2.png'),
  require('@/assets/imgs/3.png'),
  require('@/assets/imgs/4.png'),
  require('@/assets/imgs/5.png'),
  require('@/assets/imgs/6.png'),
] as const;

/** Returns the local asset for a 1-based profile picture index. Defaults to pic 1. */
export const getProfilePic = (image?: number | null) => PROFILE_PICS[(image ?? 1) - 1];

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