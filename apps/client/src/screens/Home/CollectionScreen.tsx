import { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useGetCurrentUser, useGetAllMovies, useGetMyReviews } from '@/services';
import { spacing, colors } from '@/config';
import CollectionStats from '@/components/CollectionStats';
import MovieGrid from '@/components/MovieGrid';
import MovieGridSkeleton from '@/components/MovieGridSkeleton';
import Screen from '@/components/Screen';

export default function CollectionScreen() {
  const { data: user, isLoading: isUserLoading, refetch: refetchUser } = useGetCurrentUser();
  const { data: allMovies, isLoading: isMoviesLoading, refetch: refetchMovies } = useGetAllMovies();
  const { data: myReviews, isLoading: isReviewsLoading, refetch: refetchReviews } = useGetMyReviews();

  const isLoading = isUserLoading || isMoviesLoading || isReviewsLoading;

  const seenMovies = useMemo(() => allMovies?.filter(m => user?.seen.includes(m._id)) ?? [], [allMovies, user?.seen]);

  const sortedMovies = useMemo(
    () => [...seenMovies].sort((a, b) => a.title.localeCompare(b.title)),
    [seenMovies],
  );

  return (
    <Screen isLoading={isLoading} skeleton={<MovieGridSkeleton />}>
      <MovieGrid
        movies={sortedMovies}
        onRefresh={() => Promise.all([refetchUser(), refetchMovies(), refetchReviews()])}
        favoriteIds={user?.favorites ?? []}
        emptyMessage={(
          <Text>
            What are you doing here... you have&nbsp;
            <Text style={{ color: colors.orange }}>
              {allMovies?.length ?? 0}
            </Text>
            &nbsp;cinematic masterpieces to watch!
          </Text>
        )}
        ListHeaderComponent={sortedMovies.length > 0 ? (
          <CollectionStats
            seenMovies={seenMovies ?? []}
            totalMovies={allMovies?.length ?? 0}
            userRatings={user?.ratings ?? []}
            reviewCount={myReviews?.length ?? 0}
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
