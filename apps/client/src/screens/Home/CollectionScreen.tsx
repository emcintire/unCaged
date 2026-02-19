import { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useCurrentUser, useFavorites, useMovies, useSeen, useMyReviews } from '@/services';
import { screen, spacing, colors } from '@/config';
import CollectionStats from '@/components/CollectionStats';
import MovieGrid from '@/components/MovieGrid';
import MovieGridSkeleton from '@/components/MovieGridSkeleton';
import Screen from '@/components/Screen';

export default function CollectionScreen() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { data: seenMovies = [], isLoading: isSeenLoading } = useSeen();
  const { data: favoriteMovies = [], isLoading: isFavoritesLoading } = useFavorites();
  const { data: allMovies = [], isLoading: isMoviesLoading } = useMovies();
  const { data: myReviews = [], isLoading: isReviewsLoading } = useMyReviews();

  const isLoading = isUserLoading || isSeenLoading || isFavoritesLoading || isMoviesLoading || isReviewsLoading;

  const favoriteIds = useMemo(
    () => new Set(favoriteMovies.map((m) => m._id)),
    [favoriteMovies],
  );

  const sortedMovies = useMemo(
    () => [...seenMovies].sort((a, b) => a.title.localeCompare(b.title)),
    [seenMovies],
  );

  return (
    <Screen isLoading={isLoading} skeleton={<MovieGridSkeleton />}>
      <MovieGrid
        movies={sortedMovies}
        favoriteIds={favoriteIds}
        emptyMessage={(
          <Text>
            What are you doing here... you have&nbsp;
            <Text style={{ color: colors.orange }}>
              {allMovies.length}
            </Text>
            &nbsp;cinematic masterpieces to watch!
          </Text>
        )}
        ListHeaderComponent={sortedMovies.length > 0 ? (
          <CollectionStats
            seenMovies={seenMovies}
            totalMovies={allMovies.length}
            userRatings={user?.ratings ?? []}
            reviewCount={myReviews.length}
          />
        ) : null}
        ListHeaderComponentStyle={styles.headerContainer}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    paddingHorizontal: spacing.md,
  },
});
