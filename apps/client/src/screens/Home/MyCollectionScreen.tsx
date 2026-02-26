import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import CollectionStats from '@/components/CollectionStats';
import FilterChips from '@/components/FilterChips';
import MovieGrid from '@/components/MovieGrid';
import MovieGridSkeleton from '@/components/MovieGridSkeleton';
import Screen from '@/components/Screen';
import { colors, spacing } from '@/config';
import { useGetAllMovies, useGetCurrentUser, useGetMyReviews } from '@/services';

type FilterMode = 'seen' | 'favorites';

const FILTERS: Array<{ value: FilterMode; label: string }> = [
  { value: 'seen', label: 'Seen' },
  { value: 'favorites', label: 'Favorites' },
];

export default function MyCollectionScreen() {
  const [filter, setFilter] = useState<FilterMode>('seen');

  const { data: user, isLoading: isUserLoading, refetch: refetchUser } = useGetCurrentUser();
  const { data: allMovies = [], isLoading: isMoviesLoading, refetch: refetchMovies } = useGetAllMovies();
  const { data: myReviews = [], isLoading: isReviewsLoading, refetch: refetchReviews } = useGetMyReviews();

  const isLoading = isUserLoading || isMoviesLoading || isReviewsLoading;

  const seenMovies = useMemo(() => allMovies.filter((m) => user?.seen?.includes(m._id)), [allMovies, user?.seen]);
  const favoriteMovies = useMemo(() => allMovies.filter((m) => user?.favorites?.includes(m._id)), [allMovies, user?.favorites]);

  const displayedMovies = useMemo(
    () => [...(filter === 'seen' ? seenMovies : favoriteMovies)].sort((a, b) => a.title.localeCompare(b.title)),
    [filter, seenMovies, favoriteMovies],
  );

  const refreshAll = () => Promise.all([refetchUser(), refetchMovies(), refetchReviews()]);

  return (
    <Screen isLoading={isLoading} skeleton={<MovieGridSkeleton />}>
      <MovieGrid
        movies={displayedMovies}
        onRefresh={refreshAll}
        favoriteIds={user?.favorites}
        emptyMessage={filter === 'seen' ? (
          <Text>
            What are you doing here... you have&nbsp;
            <Text style={{ color: colors.orange }}>{allMovies.length}</Text>
            &nbsp;cinematic masterpieces to watch!
          </Text>
        ) : (
          <Text>You haven&apos;t favorited any movies yet.</Text>
        )}
        ListHeaderComponent={(
          <>
            {seenMovies.length > 0 && (
              <CollectionStats
                seenMovies={seenMovies}
                totalMovies={allMovies.length}
                userRatings={user?.ratings}
                reviewCount={myReviews.length}
              />
            )}
            <FilterChips
              options={FILTERS}
              selected={filter}
              onSelect={setFilter}
              style={styles.chipRow}
            />
          </>
        )}
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
  chipRow: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
});
