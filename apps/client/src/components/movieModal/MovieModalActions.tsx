import type { MaterialCommunityIcons as MaterialCommunityIconsType } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, fontFamily, fontSize } from '@/config';
import { useAuth, useOptimisticDebounce } from '@/hooks';
import {
  getGetCurrentUserQueryKey,
  type Movie, useAddToFavorites, useAddToSeen, useAddToWatchlist,
  useGetCurrentUser, useRemoveFromFavorites, useRemoveFromSeen, useRemoveFromWatchlist,
} from '@/services';

import Icon from '../Icon';
import MovieModalRating from './MovieModalRating';

const showAlert = () => Alert.alert(
  'Hello traveler',
  'I have been paying out of my own pocket to keep the lights on at unCaged since it was released, ' +
  'and I am proud to keep unCaged Ad-Free. I do this selfless act not for the glory, nor the riches. ' +
  'Nay, I do it for the people. Consider helping me in my holy mission.',
  [
    { text: 'Later', style: 'cancel' },
    {
      text: 'Help the mission',
      onPress: () => Linking.openURL('https://www.buymeacoffee.com/greasyfingers'),
    },
  ],
);

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
      if (newSeen && user?.seen.length === 0) {
        showAlert();
      }
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
            <TouchableOpacity onPress={action.onPress} accessibilityRole="button" accessibilityLabel={`${action.active ? 'Remove from' : 'Add to'} ${action.label}`}>
              <Icon
                name={action.icon}
                size={60}
                backgroundColor={colors.bg}
                iconColor={action.active ? colors.orange : colors.medium}
              />
            </TouchableOpacity>
            <Text style={[styles.label, { color: action.labelColor }]}>{action.label}</Text>
          </View>
        ))}
      </View>
      {showStars && <MovieModalRating rating={rating} movie={movie} />}
    </>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  actionItem: {
    alignItems: 'center',
  },
  label: {
    position: 'absolute',
    top: 45,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
});
