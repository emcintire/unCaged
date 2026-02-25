import { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, Text, Animated } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Movie, useGetCurrentUser, useGetAllMovies } from '@/services';
import { borderRadius, colors, fontFamily, fontSize, shadow, spacing } from '@/config';
import { useAnimatedValue } from '@/hooks';
import { changeResolution } from '@/utils';
import AdBanner from '@/components/AdBanner';
import MovieModal from '@/components/movieModal/MovieModal';
import RandomMovieFilters from '@/components/RandomMovieFilters';
import Screen from '@/components/Screen';

export default function RandomMovieScreen() {
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);
  const [genreFilter, setGenreFilter] = useState('All');
  const [mandyFilter, setMandyFilter] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [movieKey, setMovieKey] = useState(0);
  const [watchlistFilter, setWatchlistFilter] = useState(false);
  const [unseenFilter, setUnseenFilter] = useState(false);
  const poolRef = useRef<Array<Movie>>([]);

  const { data: user, isLoading: isUserLoading } = useGetCurrentUser();
  const { data: allMovies = [], isLoading: isMoviesLoading } = useGetAllMovies();
  const isAdmin = user?.isAdmin ?? false;
  const isLoading = isUserLoading || isMoviesLoading;

  const getFilteredMovies = useCallback(() => {
    const predicates = [
      (m: Movie) => genreFilter === 'All' || m.genres.includes(genreFilter),
      (m: Movie) => !mandyFilter || m.title.toLowerCase().includes('mandy'),
      (m: Movie) => !unseenFilter || !user?.seen.includes(m._id),
      (m: Movie) => !watchlistFilter || user?.watchlist.includes(m._id),
    ];
    return allMovies.filter(m => predicates.every(p => p(m)));
  }, [allMovies, genreFilter, mandyFilter, unseenFilter, watchlistFilter, user]);

  const pickRandom = useCallback((from: Array<Movie>) => {
    if (!from.length) { setMovie(null); return []; }
    const idx = Math.floor(Math.random() * from.length);
    const picked = from[idx];
    if (!picked) return from;
    setMovieKey(k => k + 1);
    setMovie(changeResolution('w_900,f_auto,q_90', picked));
    return from.filter((_, i) => i !== idx);
  }, [setMovieKey]);

  useEffect(() => {
    if (isLoading || !allMovies.length) return;
    const filtered = getFilteredMovies();
    poolRef.current = pickRandom(filtered);
  }, [isLoading, allMovies, getFilteredMovies, pickRandom]);

  const getRandomMovie = useCallback(() => {
    if (!poolRef.current.length) {
      poolRef.current = getFilteredMovies();
    }
    poolRef.current = pickRandom(poolRef.current);
  }, [getFilteredMovies, pickRandom]);

  const fade = useAnimatedValue(1);
  const waitingForImage = useRef(false);

  const fadeIn = useCallback(() => {
    fade.timeTo(1, { duration: 300 });
  }, [fade]);

  const handleGetRandomMovie = useCallback(() => {
    fade.timeTo(0, {
      duration: 150,
      onDone: () => {
        waitingForImage.current = true;
        getRandomMovie();
      },
    });
  }, [fade, getRandomMovie]);

  useEffect(() => {
    if (waitingForImage.current && (movie === null || !movie.image)) {
      waitingForImage.current = false;
      fadeIn();
    }
  }, [movie, movieKey, fadeIn]);

  return (
    <Screen isLoading={isLoading}>
      {!isAdmin && <AdBanner />}
      <MovieModal
        movie={movie}
        onClose={() => setModalVisible(false)}
        isOpen={modalVisible}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={filtersModalVisible}
        onRequestClose={() => setFiltersModalVisible(false)}
      >
        <RandomMovieFilters
          genreFilter={genreFilter}
          mandyFilter={mandyFilter}
          setFiltersModalVisible={setFiltersModalVisible}
          setGenreFilter={setGenreFilter}
          setMandyFilter={setMandyFilter}
          setUnseenFilter={setUnseenFilter}
          setWatchlistFilter={setWatchlistFilter}
          unseenFilter={unseenFilter}
          watchlistFilter={watchlistFilter}
        />
      </Modal>
      <View style={styles.content}>
        <Animated.View style={[styles.movieArea, { opacity: fade.value }]}>
          {movie == null ? (
            <Text style={styles.emptyText}>No results :(</Text>
          ) : (
            <TouchableOpacity
              style={styles.movieButton}
              onPress={() => setModalVisible(true)}
            >
              <Image
                key={movieKey}
                source={movie.image}
                style={styles.movieImage}
                contentFit="cover"
                onLoadEnd={() => {
                  if (waitingForImage.current) {
                    waitingForImage.current = false;
                    fadeIn();
                  }
                }}
              />
              {user?.favorites?.includes(movie._id) && (
                <View style={styles.badge}>
                  <MaterialCommunityIcons name="heart" size={18} color={colors.orange} />
                </View>
              )}
              {user?.seen?.includes(movie._id) && (
                <View style={[styles.badge, user?.favorites?.includes(movie._id) ? styles.secondBadge : undefined]}>
                  <MaterialCommunityIcons name="eye" size={18} color={colors.orange} />
                </View>
              )}
            </TouchableOpacity>
          )}
        </Animated.View>
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.refreshBtn} onPress={handleGetRandomMovie}>
            <View style={styles.inner}>
              <Text style={styles.text}>CAGE ME</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filtersBtn} onPress={() => setFiltersModalVisible(true)}>
            <MaterialCommunityIcons name="tune" color={colors.medium} size={35} />
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  movieArea: {
    alignItems: 'center',
  },
  emptyText: {
    color: colors.medium,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    textAlign: 'center',
  },
  movieButton: {
    width: '75%',
    maxHeight: '90%',
    aspectRatio: 2 / 3,
    ...shadow.lg,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.black,
  },
  movieImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  bottomBar: {
    width: '100%',
    alignItems: 'center',
  },
  refreshBtn: {
    height: 60,
    width: 150,
    backgroundColor: colors.orangeBg,
    borderRadius: borderRadius.md,
  },
  inner: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 55,
    width: 150,
    borderRadius: borderRadius.md,
    backgroundColor: colors.orange,
  },
  text: {
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.black,
    color: colors.white,
  },
  filtersBtn: {
    position: 'absolute',
    left: '50%',
    marginLeft: 75 + spacing.sm,
    padding: spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: `${colors.black}CC`,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondBadge: {
    right: 48,
  },
});
