import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import type { MaterialCommunityIcons as MaterialCommunityIconsType } from '@expo/vector-icons';
import { useAuth } from '@/hooks';
import { colors, fontFamily, fontSize } from '@/config';
import {
  useAddToSeen, useRemoveFromSeen, useAddToFavorites, useRemoveFromFavorites, useAddToWatchlist,
  useRemoveFromWatchlist, type Movie, useGetCurrentUser, getGetCurrentUserQueryKey,
} from '@/services';
import MovieModalRating from './MovieModalRating';
import Icon from '../Icon';

type Props = {
  movie: Movie;
};

export default function MovieModalActions({ movie }: Props) {
  const [showStars, setShowStars] = useState(false);

  const addToSeenMutation = useAddToSeen();
  const removeFromSeenMutation = useRemoveFromSeen();
  const addToFavoritesMutation = useAddToFavorites();
  const removeFromFavoritesMutation = useRemoveFromFavorites();
  const addToWatchlistMutation = useAddToWatchlist();
  const removeFromWatchlistMutation = useRemoveFromWatchlist();

  const { isAuthenticated } = useAuth();

  const { data: user, refetch } = useGetCurrentUser({
    query: {
      enabled: isAuthenticated,
      queryKey: getGetCurrentUserQueryKey(),
    },
  });

  const favorite = user?.favorites.includes(movie._id) ?? false;
  const seen = user?.seen.includes(movie._id) ?? false;
  const watchlist = user?.watchlist.includes(movie._id) ?? false;
  const rating = user?.ratings.find((r) => r.movie === movie._id)?.rating ?? 0;

  const toggleFavorite = useCallback(async () => {
    if (favorite) {
      await removeFromFavoritesMutation.mutateAsync({ data: { id: movie._id }});
    } else {
      await addToFavoritesMutation.mutateAsync({ data: { id: movie._id }});
    }
    refetch();
  }, [favorite, movie._id, addToFavoritesMutation, removeFromFavoritesMutation, refetch]);

  const toggleWatchlist = useCallback(async () => {
    if (watchlist) {
      await removeFromWatchlistMutation.mutateAsync({ data: { id: movie._id }});
    } else {
      await addToWatchlistMutation.mutateAsync({ data: { id: movie._id }});
    }
    refetch();
  }, [watchlist, movie._id, addToWatchlistMutation, removeFromWatchlistMutation, refetch]);

  const toggleSeen = useCallback(async () => {
    if (seen) {
      await removeFromSeenMutation.mutateAsync({ data: { id: movie._id }});
      refetch();
    } else {
      const isFirstSeen = user?.seen.length === 0;
      await addToSeenMutation.mutateAsync({ data: { id: movie._id }});

      if (watchlist) {
        await toggleWatchlist();
      }
      refetch();

      if (isFirstSeen) {
        Alert.alert(
          'Hello traveler',
          'I have been paying out of my own pocket to keep the lights on at unCaged since it was released, and I am proud to keep unCaged Ad-Free. I do this selfless act not for the glory, nor the riches. Nay, I do it for the people. Consider helping me in my holy mission.',
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Help the mission',
              onPress: () => Linking.openURL('https://www.buymeacoffee.com/greasyfingers'),
            },
          ],
        );
      }
    }
  }, [seen, movie, addToSeenMutation, removeFromSeenMutation, refetch, user, watchlist, toggleWatchlist]);

  const actions: Array<{
    active: boolean;
    icon: keyof typeof MaterialCommunityIconsType.glyphMap;
    label: string;
    onPress: () => void;
    labelColor: string;
  }> = useMemo(() => [{
    active: seen,
    icon: 'eye',
    label: 'Seen',
    onPress: toggleSeen,
    labelColor: seen ? colors.orange : colors.medium,
  }, {
    active: rating > 0,
    icon: 'star',
    label: 'Rate',
    onPress: () => setShowStars(!showStars),
    labelColor: rating > 0 ? colors.orange : colors.medium,
  }, {
    active: favorite,
    icon: 'heart',
    label: 'Favorite',
    onPress: toggleFavorite,
    labelColor: favorite ? colors.orange : colors.medium,
  }, {
    active: watchlist,
    icon: 'bookmark',
    label: 'Watchlist',
    onPress: toggleWatchlist,
    labelColor: watchlist ? colors.orange : colors.medium,
  }], [seen, rating, favorite, watchlist, toggleSeen, toggleFavorite, toggleWatchlist, showStars]);

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
      {showStars && <MovieModalRating rating={rating} setRating={() => {}} movie={movie} onSeenAdded={() => {}} />}
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
