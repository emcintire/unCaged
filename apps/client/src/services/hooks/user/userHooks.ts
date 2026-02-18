import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/logger';
import { showErrorToast } from '@/config';
import { useAuth } from '@/hooks';
import { zodiosClient } from '../../zodiosClient';
import { userKeys } from './userKeys';
import { movieKeys } from '../movie/movieKeys';

// ============================================
// Query Hooks
// ============================================

export const useCurrentUser = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: userKeys.detail(),
    queryFn: zodiosClient.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    throwOnError: false,
  });
};

export const useWatchlist = () => {
  return useQuery({
    queryKey: userKeys.watchlist(),
    queryFn: zodiosClient.getWatchlist,
  });
};

export const useFavorites = () => {
  return useQuery({
    queryKey: userKeys.favorites(),
    queryFn: zodiosClient.getFavorites,
  });
};

export const useSeen = () => {
  return useQuery({
    queryKey: userKeys.seen(),
    queryFn: zodiosClient.getSeen,
  });
};

export const useRatings = () => {
  return useQuery({
    queryKey: userKeys.ratings(),
    queryFn: zodiosClient.getRatings,
  });
};

// ============================================
// Mutation Hooks
// ============================================

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) => zodiosClient.login(credentials),
    onError: (error) => showErrorToast(error.message),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: { name?: string; email: string; password: string }) => zodiosClient.register(data),
    onError: (error) => showErrorToast(error.message),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await zodiosClient.forgotPassword(data);
      logger.debug('Forgot password response received', { context: 'useForgotPassword' });
      return response;
    },
    onError: (error) => {
      logger.error('Forgot password failed', error, { context: 'useForgotPassword' });
    },
  });
};

export const useCheckCode = () => {
  return useMutation({
    mutationFn: (data: { code: string }) => zodiosClient.checkCode(data),
    onError: (error) => showErrorToast(error.message),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { password: string }) => zodiosClient.changePassword(data),
    onError: (error) => showErrorToast(error.message),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; email?: string; img?: string }) => zodiosClient.updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail() });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useUpdateUserImage = () => {
  return useMutation({
    mutationFn: (data: { img: string }) => zodiosClient.updateUser(data),
    onError: (error) => showErrorToast(error.message),
  });
};

export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => zodiosClient.addToWatchlist({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.watchlist() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail() });
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useRemoveFromWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => zodiosClient.removeFromWatchlist({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.watchlist() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail() });
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => zodiosClient.addToFavorites({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.favorites() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail() });
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => zodiosClient.removeFromFavorites({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.favorites() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail() });
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useAddToSeen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => zodiosClient.addToSeen({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.seen() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail() });
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useRemoveFromSeen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => zodiosClient.removeFromSeen({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.seen() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail() });
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useRateMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; rating: number }) => zodiosClient.rateMovie(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.ratings() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail() });
      queryClient.invalidateQueries({ queryKey: movieKeys.avgRating(variables.id) });
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useDeleteRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string }) => zodiosClient.deleteRating(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.ratings() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail() });
      queryClient.invalidateQueries({ queryKey: movieKeys.avgRating(variables.id) });
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: (data: { id: string }) => zodiosClient.deleteUser(data),
    onError: (error) => showErrorToast(error.message),
  });
};
