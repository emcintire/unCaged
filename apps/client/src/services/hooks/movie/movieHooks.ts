import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showErrorToast, showSuccessToast } from '@/config';
import { zodiosClient } from '../../zodiosClient';
import { CreateMovieData, FilteredMoviesData } from '../../schemas';
import { movieKeys } from './movieKeys';

// ============================================
// Query Hooks
// ============================================

export const useMovies = () => {
  return useQuery({
    queryKey: movieKeys.list(),
    queryFn: () => zodiosClient.getMovies({}),
    staleTime: 10 * 60 * 1000, // 10 minutes,
  });
};

export const useQuote = () => {
  return useQuery({
    queryKey: movieKeys.quote(),
    queryFn: async () => {
      const result = await zodiosClient.getQuote();
      // Handle both single quote and array of quotes
      return Array.isArray(result) ? result[0] : result;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useAverageRating = (movieId: string) => {
  return useQuery({
    queryKey: movieKeys.avgRating(movieId),
    queryFn: () => zodiosClient.getAverageRating({ params: { id: movieId } }),
    enabled: !!movieId,
  });
};

export const useFilteredMovies = (filters: FilteredMoviesData, enabled: boolean = true) => {
  return useQuery({
    queryKey: movieKeys.list(JSON.stringify(filters)),
    queryFn: () => zodiosClient.getFilteredMovies(filters),
    enabled,
  });
};

export const useSearchMovies = (searchQuery: string) => {
  return useQuery({
    queryKey: movieKeys.search(searchQuery),
    queryFn: () => zodiosClient.searchMovies({ search: searchQuery }),
    enabled: searchQuery.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePopularMovies = () => {
  return useQuery({
    queryKey: movieKeys.popular(),
    queryFn: () => zodiosClient.getPopularMovies(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useStaffPicks = () => {
  return useQuery({
    queryKey: movieKeys.staffPicks(),
    queryFn: () => zodiosClient.getStaffPicks(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ============================================
// Mutation Hooks
// ============================================

export const useAddQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { quote: string; subquote: string }) => zodiosClient.addQuote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.quote() });
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useCreateMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMovieData) => zodiosClient.createMovie(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.list() });
      showSuccessToast('Movie created');
    },
    onError: (error) => showErrorToast(error.message),
  });
};
