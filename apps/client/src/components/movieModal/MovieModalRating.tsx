import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { type Movie, useDeleteRating, useRateMovie, useAddToSeen, useGetCurrentUser, getGetCurrentUserQueryKey, getGetAverageRatingQueryKey } from '@/services';
import { borderRadius, colors, spacing } from '@/config';
import { useAuth } from '@/hooks';
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

export default function MovieModalRating({ movie, rating: ratingProp }: Props) {
  const [rating, setRating] = useState(ratingProp);
  const committedRatingRef = useRef(ratingProp);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from prop when parent updates (after server refetch)
  useEffect(() => {
    setRating(ratingProp);
    committedRatingRef.current = ratingProp;
  }, [ratingProp]);

  // Clear pending commit on unmount
  useEffect(() => {
    return () => {
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    };
  }, []);

  const rateMovieMutation = useRateMovie();
  const deleteRatingMutation = useDeleteRating();
  const addToSeenMutation = useAddToSeen();

  const isPending = rateMovieMutation.isPending || deleteRatingMutation.isPending || addToSeenMutation.isPending;

  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const userQueryKey = getGetCurrentUserQueryKey();
  const avgRatingQueryKey = getGetAverageRatingQueryKey(movie._id);

  const { data: isSeen } = useGetCurrentUser({
    query: {
      enabled: isAuthenticated,
      queryKey: userQueryKey,
      select: (data) => data.seen.includes(movie._id),
    },
  });

  // Keep isSeen in a ref so the setTimeout closure always reads the latest value
  const isSeenRef = useRef(isSeen);
  useEffect(() => { isSeenRef.current = isSeen; }, [isSeen]);

  const handleRating = (star: number) => () => {
    const newRating =
      rating === star ? star - 0.5 :
      rating === star - 0.5 ? 0 :
      star;

    setRating(newRating);

    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);

    const prev = committedRatingRef.current;

    commitTimerRef.current = setTimeout(async () => {
      if (newRating === committedRatingRef.current) return;
      committedRatingRef.current = newRating;
      try {
        if (newRating === 0) {
          await deleteRatingMutation.mutateAsync({ data: { id: movie._id } });
        } else {
          await rateMovieMutation.mutateAsync({ data: { id: movie._id, rating: newRating } });
          if (!isSeenRef.current) {
            await addToSeenMutation.mutateAsync({ data: { id: movie._id } });
          }
        }
      } catch {
        setRating(prev);
        committedRatingRef.current = prev;
      } finally {
        void queryClient.invalidateQueries({ queryKey: userQueryKey });
        void queryClient.invalidateQueries({ queryKey: avgRatingQueryKey });
      }
    }, 400);
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
