import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showErrorToast, showSuccessToast } from '@/config';
import { zodiosClient } from '../../zodiosClient';
import { reviewKeys } from './reviewKeys';

// ============================================
// Query Hooks
// ============================================

export const useReviewsByMovie = (
  movieId: string,
  page: number,
  sort: 'recent' | 'popular',
) => {
  return useQuery({
    queryKey: [...reviewKeys.byMovie(movieId), page, sort],
    queryFn: () =>
      zodiosClient.getReviewsByMovie({
        queries: { movieId, page, limit: 10, sort },
      }),
    enabled: !!movieId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useMyReviews = () => {
  return useQuery({
    queryKey: reviewKeys.myReviews(),
    queryFn: () => zodiosClient.getMyReviews(),
    staleTime: 5 * 60 * 1000,
  });
};

export type AdminReviewFilters = {
  page: number;
  flaggedOnly?: boolean;
  userEmail?: string | undefined;
  movieTitle?: string | undefined;
};

export const useAdminReviews = (filters: AdminReviewFilters) => {
  return useQuery({
    queryKey: reviewKeys.admin(JSON.stringify(filters)),
    queryFn: () =>
      zodiosClient.getAdminReviews({
        queries: {
          page: filters.page,
          limit: 20,
          flaggedOnly: filters.flaggedOnly,
          userEmail: filters.userEmail,
          movieTitle: filters.movieTitle,
        },
      }),
    staleTime: 0,
  });
};

// ============================================
// Mutation Hooks
// ============================================

export const useCreateReview = (movieId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { text: string; rating?: number; isSpoiler?: boolean }) =>
      zodiosClient.createReview({ movieId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.byMovie(movieId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.myReviews() });
      showSuccessToast('Review submitted!');
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useDeleteReview = (movieId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) =>
      zodiosClient.deleteReview(undefined, { params: { reviewId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.byMovie(movieId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.myReviews() });
      showSuccessToast('Review deleted');
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useToggleLike = (movieId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) =>
      zodiosClient.toggleReviewLike(undefined, { params: { reviewId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.byMovie(movieId) });
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useFlagReview = (movieId: string) => {
  return useMutation({
    mutationFn: (reviewId: string) =>
      zodiosClient.flagReview(undefined, { params: { reviewId } }),
    onSuccess: () => {
      showSuccessToast('Review reported. Thank you!');
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useAdminUnflagReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) =>
      zodiosClient.unflagReview(undefined, { params: { reviewId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.admin() });
      showSuccessToast('Review unflagged');
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useAdminDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) =>
      zodiosClient.deleteReview(undefined, { params: { reviewId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.admin() });
      showSuccessToast('Review deleted');
    },
    onError: (error) => showErrorToast(error.message),
  });
};
