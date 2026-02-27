import { type MaterialCommunityIcons as MaterialCommunityIconsType } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Icon from '@/components/Icon';
import { colors, fontFamily, fontSize, spacing } from '@/config';
import { useAuth, useOptimisticDebounce } from '@/hooks';
import {
  getGetCurrentUserQueryKey,
  type Movie, useAddToFavorites, useAddToSeen, useAddToWatchlist,
  useGetCurrentUser, useRemoveFromFavorites, useRemoveFromSeen, useRemoveFromWatchlist,
} from '@/services';

import MovieModalRating from './MovieModalRating';

type Props = {
  movie: Movie;
};

export default function MovieModalActions({ movie }: Props) {
  const [showStars, setShowStars] = useState(false);
  const [rating, setRating] = useState(0);

  const addToSeenMutation = useAddToSeen();
  const removeFromSeenMutation = useRemoveFromSeen();
  const addToFavoritesMutation = useAddToFavorites();
  const removeFromFavoritesMutation = useRemoveFromFavorites();
  const addToWatchlistMutation = useAddToWatchlist();
  const removeFromWatchlistMutation = useRemoveFromWatchlist();

  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const userQueryKey = getGetCurrentUserQueryKey();

  const { data: user } = useGetCurrentUser({
    query: {
      enabled: isAuthenticated,
      queryKey: userQueryKey,
    },
  });

  const invalidateUser = () => void queryClient.invalidateQueries({ queryKey: userQueryKey });

  const seen = useOptimisticDebounce(
    false,
    async (newSeen) => {
      await (newSeen
        ? addToSeenMutation.mutateAsync({ data: { id: movie._id } })
        : removeFromSeenMutation.mutateAsync({ data: { id: movie._id } })
      );
    },
    invalidateUser,
  );

  const favorite = useOptimisticDebounce(
    false,
    async (newFavorite) => {
      await (newFavorite
        ? addToFavoritesMutation.mutateAsync({ data: { id: movie._id } })
        : removeFromFavoritesMutation.mutateAsync({ data: { id: movie._id } })
      );
    },
    invalidateUser,
  );

  const watchlist = useOptimisticDebounce(
    false,
    async (newWatchlist) => {
      await (newWatchlist
        ? addToWatchlistMutation.mutateAsync({ data: { id: movie._id } })
        : removeFromWatchlistMutation.mutateAsync({ data: { id: movie._id } })
      );
    },
    invalidateUser,
  );

  useEffect(() => {
    if (!user) return;
    seen.sync(user.seen.includes(movie._id));
    favorite.sync(user.favorites.includes(movie._id));
    watchlist.sync(user.watchlist.includes(movie._id));
    setRating(user.ratings.find((r) => r.movie === movie._id)?.rating ?? 0);
  }, [user, movie._id]);

  const actions: Array<{
    active: boolean;
    icon: keyof typeof MaterialCommunityIconsType.glyphMap;
    label: string;
    onPress: () => void;
    labelColor: string;
  }> = useMemo(() => [{
    active: seen.value,
    icon: 'eye',
    label: 'Seen',
    onPress: () => seen.set(!seen.value),
    labelColor: seen.value ? colors.orange : colors.medium,
  }, {
    active: rating > 0,
    icon: 'star',
    label: 'Rate',
    onPress: () => setShowStars(!showStars),
    labelColor: rating > 0 ? colors.orange : colors.medium,
  }, {
    active: favorite.value,
    icon: 'heart',
    label: 'Favorite',
    onPress: () => favorite.set(!favorite.value),
    labelColor: favorite.value ? colors.orange : colors.medium,
  }, {
    active: watchlist.value,
    icon: 'bookmark',
    label: 'Watchlist',
    onPress: () => watchlist.set(!watchlist.value),
    labelColor: watchlist.value ? colors.orange : colors.medium,
  }], [seen, rating, favorite, watchlist, showStars]);

  return (
    <>
      <View style={styles.actionsRow}>
        {actions.map((action) => (
          <View key={action.label} style={styles.actionItem}>
            <Icon
              accessibilityLabel={`${action.active ? 'Remove from' : 'Add to'} ${action.label}`}
              backgroundColor="transparent"
              iconColor={action.active ? colors.orange : colors.medium}
              name={action.icon}
              onPress={action.onPress}
              size={60}
              style={styles.icon}
            />
            <Text style={[styles.label, { color: action.labelColor }]}>{action.label}</Text>
          </View>
        ))}
      </View>
      {showStars && <MovieModalRating rating={rating} movie={movie} />}
    </>
  );
}

const styles = StyleSheet.create({
  icon: {
    marginTop: -10,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingBottom: spacing.sm,
  },
  actionItem: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 0,
    marginTop: 0,
  },
  label: {
    position: 'absolute',
    top: 40,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
});
