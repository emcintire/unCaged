import { Text } from 'react-native';
import { useGetCurrentUser, useGetAllMovies } from '@/services';
import { colors } from '@/config';
import Screen from '@/components/Screen';
import MovieGrid from '@/components/MovieGrid';
import MovieGridSkeleton from '@/components/MovieGridSkeleton';
import AdBanner from '@/components/AdBanner';
import { useMemo } from 'react';

export default function WatchlistScreen() {
  const { data: user, isLoading: isUserLoading, refetch: refetchUser } = useGetCurrentUser();
  const { data: movies = [], isLoading: isMoviesLoading, refetch: refetchMovies } = useGetAllMovies();

  const isLoading = isUserLoading || isMoviesLoading;
  const isAdmin = user?.isAdmin ?? false;

  const watchlistMovies = useMemo(() => {
    if (!user) { return []; }
    return movies.filter((movie) => user.watchlist.includes(movie._id));
  }, [movies, user]);

  return (
    <Screen isLoading={isLoading} skeleton={<MovieGridSkeleton />}>
      {!isAdmin && <AdBanner />}
      <MovieGrid
        movies={watchlistMovies}
        onRefresh={() => Promise.all([refetchUser(), refetchMovies()])}
        emptyMessage={(
          <Text>
            Either you are a national treasure who has seen all&nbsp;
            <Text style={{ color: colors.orange }}>
              {movies.length}
            </Text>
            &nbsp;of Nicolas Cage&apos;s cinematic masterpieces, or your watchlist is empty...
          </Text>
        )}
      />
    </Screen>
  );
}
