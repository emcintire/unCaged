import { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useCurrentUser, useFavorites, useMovies, useSeen } from '@/services';
import { screen, typography, spacing, utils, colors } from '@/config';
import AdBanner from '@/components/AdBanner';
import CollectionStats from '@/components/CollectionStats';
import MovieGrid from '@/components/MovieGrid';
import MovieGridSkeleton from '@/components/MovieGridSkeleton';
import Screen from '@/components/Screen';

export default function CollectionScreen() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { data: seenMovies = [], isLoading: isSeenLoading } = useSeen();
  const { data: favoriteMovies = [], isLoading: isFavoritesLoading } = useFavorites();
  const { data: allMovies = [], isLoading: isMoviesLoading } = useMovies();

  const isLoading = isUserLoading || isSeenLoading || isFavoritesLoading || isMoviesLoading;
  const isAdmin = user?.isAdmin ?? false;

  const favoriteIds = useMemo(
    () => new Set(favoriteMovies.map((m) => m._id)),
    [favoriteMovies],
  );

  const sortedMovies = useMemo(
    () => [...seenMovies].sort((a, b) => a.title.localeCompare(b.title)),
    [seenMovies],
  );

  return (
    <Screen isLoading={isLoading} skeleton={<MovieGridSkeleton />} style={!isLoading && seenMovies.length === 0 ? screen.centered : screen.noPadding}>
      {!isAdmin && <AdBanner />}
      {seenMovies.length === 0 ? (
        <Text style={[typography.h2, utils.textCenter]}>
          What are you doing here... you have&nbsp;
          <Text style={{ color: colors.orange }}>
            {allMovies.length}
          </Text>
          &nbsp;cinematic masterpieces to watch!
        </Text>
      ) : (
        <MovieGrid
          movies={sortedMovies}
          favoriteIds={favoriteIds}
          ListHeaderComponent={
            <CollectionStats
              seenMovies={seenMovies}
              totalMovies={allMovies.length}
              userRatings={user?.ratings ?? []}
            />
          }
          ListHeaderComponentStyle={styles.headerContainer}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    paddingHorizontal: spacing.md,
  },
});
