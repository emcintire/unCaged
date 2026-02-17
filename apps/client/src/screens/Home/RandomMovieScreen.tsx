import { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, Text, Animated } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type Movie, useCurrentUser, useMovies } from '@/services';
import { borderRadius, changeResolution, colors, fontFamily, fontSize, shadow, spacing } from '@/config';
import AdBanner from '@/components/AdBanner';
import MovieModal from '@/components/movieModal/MovieModal';
import RandomMovieFilters from '@/components/RandomMovieFilters';
import Screen from '@/components/Screen';
import { useAnimatedValue } from '@/hooks';

export default function RandomMovieScreen() {
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);
  const [genreFilter, setGenreFilter] = useState('All');
  const [mandyFilter, setMandyFilter] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [pool, setPool] = useState<Movie[]>([]);
  const [watchlistFilter, setWatchlistFilter] = useState(false);
  const [unseenFilter, setUnseenFilter] = useState(false);

  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { data: allMovies = [], isLoading: isMoviesLoading } = useMovies();
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

  const pickRandom = useCallback((from: Movie[]) => {
    if (!from.length) { setMovie(null); return []; }
    const idx = Math.floor(Math.random() * from.length);
    const picked = from[idx];
    if (!picked) return from;
    if (!picked.img) {
      setMovie(picked);
    } else {
      setMovie(picked.img.length === 32 ? changeResolution('', picked) : picked);
    }
    return from.filter((_, i) => i !== idx);
  }, []);

  // Reset pool and pick a new movie whenever filters or data change
  useEffect(() => {
    if (isLoading || !allMovies.length) return;
    const filtered = getFilteredMovies();
    setPool(pickRandom(filtered));
  }, [isLoading, allMovies.length, getFilteredMovies, pickRandom]);

  const getRandomMovie = useCallback(() => {
    const currentPool = pool.length > 0 ? pool : getFilteredMovies();
    setPool(pickRandom(currentPool));
  }, [pool, getFilteredMovies, pickRandom]);

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

  // Fade in immediately if new movie has no image or is null (no image to wait for)
  useEffect(() => {
    if (waitingForImage.current && (movie === null || !movie.img)) {
      waitingForImage.current = false;
      fadeIn();
    }
  }, [movie, fadeIn]);

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
            <Text style={styles.noResults}>No results :(</Text>
          ) : (
            <TouchableOpacity
              style={styles.movieButton}
              onPress={() => setModalVisible(true)}
            >
              <Image
                source={movie.img}
                style={styles.movieImage}
                contentFit="cover"
                onLoadEnd={() => {
                  if (waitingForImage.current) {
                    waitingForImage.current = false;
                    fadeIn();
                  }
                }}
              />
              {user?.favorites.includes(movie._id) && (
                <View style={styles.badge}>
                  <MaterialCommunityIcons name="heart" size={18} color={colors.orange} />
                </View>
              )}
              {user?.seen.includes(movie._id) && (
                <View style={[styles.badge, user?.favorites.includes(movie._id) ? styles.secondBadge : undefined]}>
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
            <MaterialCommunityIcons name="tune" color="grey" size={35} />
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
  noResults: {
    color: 'white',
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
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
    backgroundColor: '#976000',
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
    color: 'white',
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
    backgroundColor: colors.black + 'CC',
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
