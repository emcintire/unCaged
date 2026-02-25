import { useCallback, useMemo,useState } from 'react';
import { ScrollView, StyleSheet, Text,View } from 'react-native';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';

import BuyMeCoffeeButton from '@/components/BuyMeCoffeeButton';
import MovieCard from '@/components/MovieCard';
import MovieModal from '@/components/movieModal/MovieModal';
import PullToRefresh from '@/components/PullToRefresh';
import Screen from '@/components/Screen';
import Skeleton from '@/components/Skeleton';
import { borderRadius,fontFamily, fontSize, spacing } from '@/config';
import { useAuth } from '@/hooks';
import {
  getGetCurrentUserQueryKey,
  type Movie,
  useGetAllMovies,
  useGetCurrentUser,
  useGetPopularMovies,
  useGetQuote,
  useGetStaffPicks,
} from '@/services';

const styles = StyleSheet.create({
  quote: {
    fontFamily: fontFamily.extraLight,
    fontSize: fontSize.xxl,
    color: 'white',
    textAlign: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.sm,
  },
  subquote: {
    marginTop: spacing.sm,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: 'white',
    textAlign: 'center',
  },
  subsubquote: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    fontFamily: fontFamily.extraLight,
    fontSize: fontSize.sm,
    color: 'white',
    textAlign: 'center',
  },
  header: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.xxl,
    color: 'white',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
  },
  button: {
    marginRight: spacing.sm,
    width: 135,
    height: 200,
  },
  scrollContent: {
    marginLeft: 15,
    paddingVertical: spacing.sm,
  },
  listSpacer: {
    width: 20,
  },
    container: {
    flex: 1,
  },
  quoteBlock: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.sm,
  },
  quoteLine: {
    marginTop: spacing.xs,
  },
  row: {
    marginTop: spacing.lg,
  },
  card: {
    marginRight: spacing.sm,
  },
});

const genres = [
  'Action',
  'Drama',
  'Thriller',
  'Comedy',
  'Family',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Crime',
  'War',
  'Mystery',
  'Fantasy',
];

const ROWS = Array.from({ length: 4 }, (_, i) => i);
const CARDS_PER_ROW = Array.from({ length: 4 }, (_, i) => i);
const CARD_WIDTH = 135;
const CARD_HEIGHT = 200;

function HomeScreenSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <View style={styles.quoteBlock}>
        <Skeleton width="80%" height={22} />
        <Skeleton width="60%" height={22} style={styles.quoteLine} />
        <Skeleton width="40%" height={14} style={styles.subquote} />
        <Skeleton width="30%" height={10} style={styles.subsubquote} />
      </View>
      {ROWS.map((row) => (
        <View key={row} style={styles.row}>
          <Skeleton width="30%" height={22} style={styles.header} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {CARDS_PER_ROW.map((card) => (
              <Skeleton
                key={card}
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                borderRadiusValue={borderRadius.sm}
                style={styles.card}
              />
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}

export default function HomeScreen() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const { isAuthenticated } = useAuth();

  const { data: user } = useGetCurrentUser({
    query: {
      enabled: isAuthenticated,
      queryKey: getGetCurrentUserQueryKey(),
    },
  });
  const { data: movies = [], isLoading: moviesLoading, refetch: refetchMovies } = useGetAllMovies();
  const { data: popularMovies = [], isLoading: popularLoading, refetch: refetchPopular } = useGetPopularMovies();
  const { data: staffPicks = [], isLoading: staffPicksLoading, refetch: refetchStaffPicks } = useGetStaffPicks();
  const { data: quote, isLoading: quoteLoading, refetch: refetchQuote } = useGetQuote();

  const refetchAll = useCallback(
    () => Promise.all([refetchMovies(), refetchPopular(), refetchStaffPicks(), refetchQuote()]),
    [refetchMovies, refetchPopular, refetchStaffPicks, refetchQuote],
  );

  const isLoading = moviesLoading || popularLoading || staffPicksLoading || quoteLoading;

  const favoriteIds = useMemo(() => new Set(user?.favorites ?? []), [user?.favorites]);
  const seenIds = useMemo(() => new Set(user?.seen ?? []), [user?.seen]);

  const seededShuffle = useCallback(<T,>(arr: Array<T>, seed: string): Array<T> => {
    let s = Array.from(seed).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return [...arr].sort(() => { s = (s * 1664525 + 1013904223) & 0xffffffff; return s / 0x100000000 - 0.5; });
  }, []);

  const customRows = useMemo(
    () => [
      { label: 'Popular', data: seededShuffle(popularMovies, 'Popular') },
      { label: 'Staff Picks', data: seededShuffle(staffPicks, 'Staff Picks') },
    ],
    [popularMovies, staffPicks, seededShuffle],
  );

  const genreRows = useMemo(
    () => genres.map((genre) => ({
      label: genre,
      data: seededShuffle(movies.filter((movie) => movie.genres.includes(genre)), genre),
    })),
    [movies, seededShuffle],
  );

  return (
    <Screen isLoading={isLoading} skeleton={<HomeScreenSkeleton />}>
      <MovieModal
        isOpen={selectedMovie != null}
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        refreshControl={<PullToRefresh onRefresh={refetchAll} />}
      >
        <Text style={styles.quote}>{quote?.quote}</Text>
        <Text style={styles.subquote}>{quote?.subquote}</Text>
        <Text style={styles.subsubquote}>Verse of the Week</Text>
        {customRows.map(({ label, data }) => (
          <View key={label}>
            <Text style={styles.header}>{label}</Text>
            <GHScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={200}
              decelerationRate="fast"
              contentContainerStyle={styles.scrollContent}
            >
              {data.map((movie) => (
                <MovieCard
                  key={`${label}-${movie._id}`}
                  movie={movie}
                  onPress={() => setSelectedMovie(movie)}
                  isFavorite={favoriteIds.has(movie._id)}
                  isSeen={seenIds.has(movie._id)}
                  buttonStyle={styles.button}
                />
              ))}
              <View style={styles.listSpacer} />
            </GHScrollView>
          </View>
        ))}
        {genreRows.map(({ label, data }) => (
          <View key={label}>
            <Text style={styles.header}>{label}</Text>
            <GHScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={200}
              decelerationRate="fast"
              contentContainerStyle={styles.scrollContent}
            >
              {data.map((movie) => (
                <MovieCard
                  key={`${label}-${movie._id}`}
                  movie={movie}
                  onPress={() => setSelectedMovie(movie)}
                  isFavorite={favoriteIds.has(movie._id)}
                  isSeen={seenIds.has(movie._id)}
                  buttonStyle={styles.button}
                />
              ))}
              <View style={styles.listSpacer} />
            </GHScrollView>
          </View>
        ))}
        <BuyMeCoffeeButton />
      </ScrollView>
    </Screen>
  );
}
