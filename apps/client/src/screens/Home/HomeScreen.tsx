import { useCallback, useMemo,useState } from 'react';
import { ScrollView, StyleSheet, Text,View } from 'react-native';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';

import BuyMeCoffeeButton from '@/components/BuyMeCoffeeButton';
import MovieCard from '@/components/MovieCard';
import MovieModal from '@/components/movieModal/MovieModal';
import PullToRefresh from '@/components/PullToRefresh';
import Screen from '@/components/Screen';
import Skeleton from '@/components/Skeleton';
import { borderRadius, colors, fontFamily, fontSize, spacing } from '@/config';
import { useAuth } from '@/hooks';
import {
  getGetCurrentUserQueryKey,
  getGetRecommendationsQueryKey,
  type Movie,
  useGetAllMovies,
  useGetCurrentUser,
  useGetPopularMovies,
  useGetQuote,
  useGetRecommendations,
  useGetStaffPicks,
} from '@/services';

const genres = [
  'Action',
  'Adventure',
  'Comedy',
  'Crime',
  'Drama',
  'Family',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'War',
];

const ROWS = Array.from({ length: 5 }, (_, i) => i);
const CARDS_PER_ROW = Array.from({ length: 6 }, (_, i) => i);
const CARD_WIDTH = 135;
const CARD_HEIGHT = 200;

function HomeScreenSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <View style={styles.quoteBlock}>
        <Skeleton width="20%" height={10} />
        <Skeleton width="80%" height={22} style={styles.quoteLine} />
        <Skeleton width="60%" height={22} style={styles.quoteLine} />
        <Skeleton width="40%" height={14} style={styles.quoteLine} />
      </View>
      {ROWS.map((row) => (
        <View key={row} style={styles.row}>
          <Skeleton width="30%" height={18} style={styles.quoteLine} />
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
  const { data: recommendations = [], refetch: refetchRecommendations } = useGetRecommendations({
    query: { enabled: isAuthenticated, queryKey: getGetRecommendationsQueryKey() },
  });
  const { data: quote, isLoading: quoteLoading, refetch: refetchQuote } = useGetQuote();

  const refetchAll = useCallback(
    () => Promise.all([refetchMovies(), refetchPopular(), refetchStaffPicks(), refetchRecommendations(), refetchQuote()]),
    [refetchMovies, refetchPopular, refetchStaffPicks, refetchRecommendations, refetchQuote],
  );

  const isLoading = moviesLoading || popularLoading || staffPicksLoading || quoteLoading;

  const favoriteIds = useMemo(() => new Set(user?.favorites ?? []), [user?.favorites]);
  const seenIds = useMemo(() => new Set(user?.seen ?? []), [user?.seen]);

  const seededShuffle = useCallback(<T,>(arr: Array<T>, seed: string): Array<T> => {
    let s = Array.from(seed).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return [...arr].sort(() => { s = (s * 1664525 + 1013904223) & 0xffffffff; return s / 0x100000000 - 0.5; });
  }, []);

  const newReleases = useMemo(
    () => [...movies].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10),
    [movies],
  );

  const customRows = useMemo<Array<{ label: string; data: Array<Movie> }>>(
    () => [
      { label: 'Popular', data: seededShuffle(popularMovies, 'Popular') },
      { label: 'New Releases', data: newReleases },
      { label: 'Staff Picks', data: seededShuffle(staffPicks, 'Staff Picks') },
      ...(isAuthenticated && recommendations.length > 0
        ? [{ label: 'You Might Like', data: recommendations }]
        : []),
    ],
    [popularMovies, newReleases, staffPicks, recommendations, isAuthenticated, seededShuffle],
  );

  const genreRows = useMemo(
    () => seededShuffle(genres, 'genres').map((genre) => ({
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
        <View style={styles.quoteContainer}>
          <Text style={styles.verseLabel}>Verse of the Week</Text>
          <Text style={styles.quote}>{quote?.quote}</Text>
          <Text style={styles.subquote}>{quote?.subquote}</Text>
        </View>
        {customRows.map(({ label, data }) => (
          <View key={label}>
            <View style={styles.headerRow}>
              <View style={styles.headerAccent} />
              <Text style={styles.header}>{label}</Text>
            </View>
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
            <View style={styles.headerRow}>
              <View style={styles.headerAccent} />
              <Text style={styles.header}>{label}</Text>
            </View>
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

const styles = StyleSheet.create({
  quoteContainer: {
    marginTop: spacing.xxl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.orange,
  },
  verseLabel: {
    fontFamily: fontFamily.extraLight,
    fontSize: fontSize.xs,
    color: colors.orange,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  quote: {
    fontFamily: fontFamily.extraLight,
    fontSize: fontSize.xl,
    color: 'white',
  },
  subquote: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.placeholder,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
    marginLeft: spacing.md,
  },
  headerAccent: {
    width: 3,
    height: 18,
    backgroundColor: colors.orange,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  header: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: 'white',
    letterSpacing: 0.3,
  },
  button: {
    marginRight: spacing.sm,
    aspectRatio: 2 / 3,
    width: 135,
  },
  scrollContent: {
    marginLeft: spacing.md,
    paddingVertical: spacing.xs,
  },
  listSpacer: {
    width: spacing.lg,
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
