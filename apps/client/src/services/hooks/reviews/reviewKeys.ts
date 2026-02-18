export const reviewKeys = {
  all: ['reviews'] as const,
  byMovie: (movieId: string) => [...reviewKeys.all, 'movie', movieId] as const,
  myReviews: () => [...reviewKeys.all, 'my'] as const,
  admin: (filters?: string) => [...reviewKeys.all, 'admin', filters] as const,
};
