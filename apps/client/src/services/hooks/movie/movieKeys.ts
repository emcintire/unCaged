export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  list: (filters?: string) => [...movieKeys.lists(), filters] as const,
  details: () => [...movieKeys.all, 'detail'] as const,
  detail: (id: string) => [...movieKeys.details(), id] as const,
  quotes: () => [...movieKeys.all, 'quotes'] as const,
  quote: () => [...movieKeys.quotes(), 'current'] as const,
  avgRating: (id: string) => [...movieKeys.all, 'avgRating', id] as const,
  search: (query: string) => [...movieKeys.all, 'search', query] as const,
  popular: () => [...movieKeys.all, 'popular'] as const,
  staffPicks: () => [...movieKeys.all, 'staffPicks'] as const,
};
