import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useEffect, useRef,useState } from 'react';
import { Animated,Modal, Pressable, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import AppDropdown from '@/components/AppDropdown';
import MovieModal from '@/components/movieModal/MovieModal';
import Screen from '@/components/Screen';
import Separator from '@/components/Separator';
import { borderRadius, colors, fontFamily, fontSize, shadow, spacing } from '@/config';
import { genres } from '@/constants';
import { useAnimatedValue } from '@/hooks';
import { type Movie, useGetAllMovies,useGetCurrentUser } from '@/services';
import type { SetState } from '@/types';
import { changeResolution } from '@/utils';

const genreOptions = ['All', ...genres] as const;

type RandomMovieFiltersProps = {
  genreFilter: string;
  mandyFilter: boolean;
  setFiltersModalVisible: SetState<boolean>;
  setGenreFilter: (genre: string) => void;
  setMandyFilter: SetState<boolean>;
  setUnseenFilter: SetState<boolean>;
  setWatchlistFilter: SetState<boolean>;
  unseenFilter: boolean;
  watchlistFilter: boolean;
};

function RandomMovieFilters({
  genreFilter,
  mandyFilter,
  setFiltersModalVisible,
  setGenreFilter,
  setMandyFilter,
  setUnseenFilter,
  setWatchlistFilter,
  unseenFilter,
  watchlistFilter,
}: RandomMovieFiltersProps) {
  return (
    <View style={fs.filtersModalContainer}>
      <Pressable
        style={fs.transparentBg}
        onPress={() => setFiltersModalVisible(false)}
        accessibilityRole="button"
        accessibilityLabel="Close filters"
      />
      <View style={fs.filtersModal}>
        <Text style={fs.headerText}>Filters</Text>
        <TouchableOpacity
          style={fs.closeBtn}
          onPress={() => setFiltersModalVisible(false)}
          accessibilityRole="button"
          accessibilityLabel="Close filters"
        >
          <MaterialCommunityIcons name="close" size={18} color={colors.light} />
        </TouchableOpacity>
        <Separator modal />
        <View style={{ width: '75%' }}>
          <Text style={fs.label}>Unseen</Text>
        </View>
        <View style={{ width: '25%' }}>
          <Switch
            onValueChange={setUnseenFilter}
            value={unseenFilter}
            trackColor={{ true: colors.orange }}
            thumbColor={colors.light}
            accessibilityLabel="Filter unseen movies"
          />
        </View>
        <Separator modal />
        <View style={{ width: '75%' }}>
          <Text style={fs.label}>On Watchlist</Text>
        </View>
        <View style={{ width: '25%' }}>
          <Switch
            onValueChange={setWatchlistFilter}
            value={watchlistFilter}
            trackColor={{ true: colors.orange }}
            thumbColor={colors.light}
            accessibilityLabel="Filter watchlist movies"
          />
        </View>
        <Separator modal />
        <View style={{ width: '75%' }}>
          <Text style={fs.label}>Masterpieces</Text>
        </View>
        <View style={{ width: '25%' }}>
          <Switch
            onValueChange={setMandyFilter}
            value={mandyFilter}
            trackColor={{ true: colors.orange }}
            thumbColor={colors.light}
            accessibilityLabel="Filter masterpiece movies"
          />
        </View>
        <Separator modal />
        <View style={{ width: '50%' }}>
          <Text style={fs.label}>Genre</Text>
        </View>
        <View style={{ width: '50%' }}>
          <AppDropdown
            items={genreOptions}
            selectedValue={genreFilter}
            onSelect={setGenreFilter}
            listStyle={fs.dropdownList}
            accessibilityLabel="Select genre filter"
          />
        </View>
      </View>
    </View>
  );
}

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
  const isLoading = isUserLoading || isMoviesLoading;

  // Keep user in a ref so getFilteredMovies can read it without becoming a
  // new function reference every time a favorite/seen/watchlist action re-fetches user
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  const getFilteredMovies = useCallback(() => {
    const u = userRef.current;
    const predicates = [
      (m: Movie) => genreFilter === 'All' || m.genres.includes(genreFilter),
      (m: Movie) => !mandyFilter || m.title.toLowerCase().includes('mandy'),
      (m: Movie) => !unseenFilter || !u?.seen.includes(m._id),
      (m: Movie) => !watchlistFilter || u?.watchlist.includes(m._id),
    ];
    return allMovies.filter(m => predicates.every(p => p(m)));
  }, [allMovies, genreFilter, mandyFilter, unseenFilter, watchlistFilter]);

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
      <View style={ss.content}>
        <Animated.View style={[ss.movieArea, { opacity: fade.value }]}>
          {movie == null ? (
            <Text style={ss.emptyText}>No results :(</Text>
          ) : (
            <TouchableOpacity
              style={ss.movieButton}
              onPress={() => setModalVisible(true)}
            >
              <Image
                key={movieKey}
                source={movie.image}
                style={ss.movieImage}
                contentFit="cover"
                onLoadEnd={() => {
                  if (waitingForImage.current) {
                    waitingForImage.current = false;
                    fadeIn();
                  }
                }}
              />
              {user?.favorites?.includes(movie._id) && (
                <View style={ss.badge}>
                  <MaterialCommunityIcons name="heart" size={18} color={colors.orange} />
                </View>
              )}
              {user?.seen?.includes(movie._id) && (
                <View style={[ss.badge, user?.favorites?.includes(movie._id) ? ss.secondBadge : undefined]}>
                  <MaterialCommunityIcons name="eye" size={18} color={colors.orange} />
                </View>
              )}
            </TouchableOpacity>
          )}
        </Animated.View>
        <View style={ss.bottomBar}>
          <TouchableOpacity style={ss.refreshBtn} onPress={handleGetRandomMovie}>
            <View style={ss.inner}>
              <Text style={ss.text}>CAGE ME</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={ss.filtersBtn} onPress={() => setFiltersModalVisible(true)}>
            <MaterialCommunityIcons name="tune" color={colors.medium} size={35} />
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const fs = StyleSheet.create({
  headerText: {
    fontFamily: fontFamily.black,
    fontSize: fontSize.xxl,
    color: colors.orange,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.overlayBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersModalContainer: {
    height: '100%',
    backgroundColor: 'transparent',
  },
  transparentBg: {
    height: '100%',
    backgroundColor: colors.backdropBg,
  },
  filtersModal: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: borderRadius.round,
    borderTopRightRadius: borderRadius.round,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.surfaceFaint,
    backgroundColor: colors.bg,
    height: '50%',
    padding: spacing.lg,
    paddingTop: 0,
    alignItems: 'center',
    alignContent: 'space-evenly',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  label: {
    color: colors.white,
    fontSize: fontSize.base,
    fontFamily: fontFamily.bold,
  },
  dropdownList: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    elevation: 5,
  },
});

const ss = StyleSheet.create({
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
