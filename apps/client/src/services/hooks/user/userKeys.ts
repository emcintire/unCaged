export const userKeys = {
  all: ['users'] as const,
  detail: () => [...userKeys.all, 'detail'] as const,
  watchlist: () => [...userKeys.all, 'watchlist'] as const,
  favorites: () => [...userKeys.all, 'favorites'] as const,
  seen: () => [...userKeys.all, 'seen'] as const,
  ratings: () => [...userKeys.all, 'ratings'] as const,
};
