import { Text } from 'react-native';
import { useCurrentUser, useMovies, useWatchlist } from '@/services';
import { colors, screen } from '@/config';
import Screen from '@/components/Screen';
import MovieGrid from '@/components/MovieGrid';
import MovieGridSkeleton from '@/components/MovieGridSkeleton';
import AdBanner from '@/components/AdBanner';

export default function WatchlistScreen() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { data: watchlistMovies = [], isLoading: isMoviesLoading } = useWatchlist();
  const { data: movies = [] } = useMovies();

  const isLoading = isUserLoading || isMoviesLoading;
  const isAdmin = user?.isAdmin ?? false;

  return (
    <Screen isLoading={isLoading} skeleton={<MovieGridSkeleton />} style={!isLoading && watchlistMovies.length === 0 ? screen.centered : screen.noPadding}>
      {!isAdmin && <AdBanner />}
      <MovieGrid
        movies={watchlistMovies}
        emptyMessage={(
          <Text>
            Either you are a national treasure who has seen all&nbsp;
            <Text style={{ color: colors.orange }}>
              {movies.length}
            </Text>
            &nbsp;of Nicolas Cage's cinematic masterpieces, or your watchlist is empty...
          </Text>
        )}
      />
    </Screen>
  );
}
