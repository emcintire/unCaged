import { StyleSheet, TouchableOpacity, View } from 'react-native'

import type { SetState } from '@/types';
import { type Movie, useDeleteRating, useRateMovie, useAddToSeen, useGetCurrentUser } from '@/services';
import { borderRadius, colors, showErrorToast, spacing } from '@/config';
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

function getStarColor(star: number, rating: number): string {
  if (rating >= star - 0.5) return colors.orange;
  return colors.medium;
}

type Props = {
  movie: Movie;
  onSeenAdded: () => void;
  rating: number;
  setRating: SetState<number>;
};

export default function MovieModalRating({ movie, onSeenAdded, rating, setRating }: Props) {
  const rateMovieMutation = useRateMovie();
  const deleteRatingMutation = useDeleteRating();
  const addToSeenMutation = useAddToSeen();
  const { data: user } = useGetCurrentUser();

  const submitRating = async (newRating: number) => {
    try {
      await rateMovieMutation.mutateAsync({ data: { id: movie._id, rating: newRating } });
      setRating(newRating);

      const isMovieSeen = user && user.seen.includes(movie._id);
      if (!isMovieSeen) {
        await addToSeenMutation.mutateAsync({ data: { id: movie._id } });
        onSeenAdded();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update rating';
      showErrorToast(message);
    }
  };

  const handleRating = (star: number) => async () => {
    if (rating === star) {
      await submitRating(star - 0.5);
    } else if (rating === star - 0.5) {
      deleteRatingMutation.mutate({ data: { id: movie._id } }, {
        onSuccess: () => setRating(0),
      });
    } else {
      await submitRating(star);
    }
  };

  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={handleRating(star)}
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
  )
}
