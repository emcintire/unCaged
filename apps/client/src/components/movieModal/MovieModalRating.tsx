import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, spacing } from '@/config';
import { useOptimisticDebounce } from '@/hooks';
import { getGetAverageRatingQueryKey, getGetCurrentUserQueryKey, type Movie, useDeleteRating, useRateMovie } from '@/services';

import Icon from '../Icon';
import { getStarIcon } from '../StarRating';

const getStarColor = (star: number, rating: number): string => {
  if (rating >= star - 0.5) return colors.orange;
  return colors.medium;
};

type Props = {
  movie: Movie;
  rating: number;
};

export default function MovieModalRating({ movie, rating: ratingProp }: Props) {
  const rateMovieMutation = useRateMovie();
  const deleteRatingMutation = useDeleteRating();

  const isPending = rateMovieMutation.isPending || deleteRatingMutation.isPending;

  const queryClient = useQueryClient();
  const userQueryKey = getGetCurrentUserQueryKey();
  const avgRatingQueryKey = getGetAverageRatingQueryKey(movie._id);

  const rating = useOptimisticDebounce(
    ratingProp,
    async (newRating) => {
      if (newRating === 0) {
        await deleteRatingMutation.mutateAsync({ data: { id: movie._id } });
      } else {
        await rateMovieMutation.mutateAsync({ data: { id: movie._id, rating: newRating } });
      }
    },
    () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKey });
      void queryClient.invalidateQueries({ queryKey: avgRatingQueryKey });
    },
  );

  // Sync from prop when parent updates (after server refetch)
  useEffect(() => { rating.sync(ratingProp); }, [ratingProp, rating.sync]);

  const handleRating = (star: number) => () => {
    const newRating =
      rating.value === star ? star - 0.5 :
      rating.value === star - 0.5 ? 0 :
      star;
    rating.set(newRating);
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
            name={getStarIcon(star, rating.value)}
            size={60}
            backgroundColor="transparent"
            iconColor={getStarColor(star, rating.value)}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

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
