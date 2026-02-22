import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import type { MaterialCommunityIcons as MaterialCommunityIconsType } from '@expo/vector-icons';
import { colors, fontFamily, fontSize } from '@/config';
import {
  useAddToSeen, useRemoveFromSeen, useAddToFavorites, useRemoveFromFavorites, useAddToWatchlist,
  useRemoveFromWatchlist, type Movie,
  useGetCurrentUser,
  getGetCurrentUserQueryKey,
} from '@/services';
import MovieModalRating from './MovieModalRating';
import Icon from '../Icon';
import { useAuth } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';

type Props = {
  movie: Movie;
};

export default function MovieModalActions({ movie }: Props) {
  const [favorite, setFavorite] = useState(false);
  const [seen, setSeen] = useState(false);
  const [watchlist, setWatchlist] = useState(false);
  const [rating, setRating] = useState(0);
  const [showStars, setShowStars] = useState(false);

  const queryClient = useQueryClient();
  const addToSeenMutation = useAddToSeen();
  const removeFromSeenMutation = useRemoveFromSeen();
  const addToFavoritesMutation = useAddToFavorites();
  const removeFromFavoritesMutation = useRemoveFromFavorites();
  const addToWatchlistMutation = useAddToWatchlist();
  const removeFromWatchlistMutation = useRemoveFromWatchlist();

  const { isAuthenticated } = useAuth();

  const { data: user } = useGetCurrentUser({
    query: {
      enabled: isAuthenticated,
      queryKey: getGetCurrentUserQueryKey(),
    },
  });

  useEffect(() => {
    if (!user) { return; }
    setFavorite(user.favorites.includes(movie._id));
    setSeen(user.seen.includes(movie._id));
    setWatchlist(user.watchlist.includes(movie._id));
    setRating(user.ratings.find((r) => r.movie === movie._id)?.rating || 0);
  }, [user, movie]);

  const toggleFavorite = () => {
    if (favorite) {
      removeFromFavoritesMutation.mutate({ data: { id: movie._id }}, {
        onSuccess: () => setFavorite(false),
      });
    } else {
      addToFavoritesMutation.mutate({ data: { id: movie._id }}, {
        onSuccess: () => setFavorite(true),
      });
    }
    queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
  };

  const toggleWatchlist = () => {
    if (watchlist) {
      removeFromWatchlistMutation.mutate({ data: { id: movie._id }}, {
        onSuccess: () => setWatchlist(false),
      });
    } else {
      addToWatchlistMutation.mutate({ data: { id: movie._id }}, {
        onSuccess: () => setWatchlist(true),
      });
    }
  };

  const toggleSeen = () => {
    if (seen) {
      removeFromSeenMutation.mutate({ data: { id: movie._id }}, {
        onSuccess: () => setSeen(false),
      });
    } else {
      const isFirstSeen = user?.seen.length === 0;
      addToSeenMutation.mutate({ data: { id: movie._id }}, {
        onSuccess: () => {
          setSeen(true);
          if (watchlist) {
            toggleWatchlist();
          }
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
        },
      });
    }
  };

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
  }], [favorite, rating, seen, showStars, watchlist]);

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
      {showStars && <MovieModalRating rating={rating} setRating={setRating} movie={movie} onSeenAdded={() => setSeen(true)} />}
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
