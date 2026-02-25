import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { type Movie, type User, useDeleteRating, useRateMovie, useAddToSeen, useGetCurrentUser, getGetCurrentUserQueryKey, getGetAverageRatingQueryKey } from '@/services';
import { borderRadius, colors, spacing } from '@/config';
import { useAuth, useOptimisticUpdate } from '@/hooks';
import { getStarIcon } from '../StarRating';
import Icon from '../Icon';

const styles = StyleSheet.create({
  stars: {
    marginTop: spacing.xs,
    backgroundColor: colors.black,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
});

const getStarColor = (star: number, rating: number): string => {
  if (rating >= star - 0.5) return colors.orange;
  return colors.medium;
};

type Props = {
  movie: Movie;
  rating: number;
};

export default function MovieModalRating({ movie, rating }: Props) {
  const rateMovieMutation = useRateMovie();
  const deleteRatingMutation = useDeleteRating();
  const addToSeenMutation = useAddToSeen();

  const isPending = rateMovieMutation.isPending || deleteRatingMutation.isPending || addToSeenMutation.isPending;

  const { isAuthenticated } = useAuth();
  const optimistic = useOptimisticUpdate();
  const queryClient = useQueryClient();
  const userQueryKey = getGetCurrentUserQueryKey();
  const avgRatingQueryKey = getGetAverageRatingQueryKey(movie._id);

  const { data: user } = useGetCurrentUser({
    query: {
      enabled: isAuthenticated,
      queryKey: userQueryKey,
    },
  });

  const submitRating = (newRating: number) =>
    optimistic<User>(
      userQueryKey,
      (old) => ({
        ...old,
        ratings: old.ratings.some((r) => r.movie === movie._id)
          ? old.ratings.map((r) => r.movie === movie._id ? { ...r, rating: newRating } : r)
          : [...old.ratings, { _id: 'temp', movie: movie._id, rating: newRating }],
        seen: old.seen.includes(movie._id) ? old.seen : [...old.seen, movie._id],
      }),
      async () => {
        await rateMovieMutation.mutateAsync({ data: { id: movie._id, rating: newRating } });
        if (!user?.seen.includes(movie._id)) {
          await addToSeenMutation.mutateAsync({ data: { id: movie._id } });
        }
      },
    );

  const handleRating = (star: number) => async () => {
    if (rating === star) {
      await submitRating(star - 0.5);
    } else if (rating === star - 0.5) {
      await optimistic<User>(
        userQueryKey,
        (old) => ({ ...old, ratings: old.ratings.filter((r) => r.movie !== movie._id) }),
        () => deleteRatingMutation.mutateAsync({ data: { id: movie._id } }),
      );
    } else {
      await submitRating(star);
    }
    void queryClient.invalidateQueries({ queryKey: avgRatingQueryKey });
  };

  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={handleRating(star)}
          disabled={isPending}
          accessibilityRole="button"
          accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Icon
            name={getStarIcon(star, rating)}
            size={60}
            backgroundColor="transparent"
            iconColor={getStarColor(star, rating)}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
