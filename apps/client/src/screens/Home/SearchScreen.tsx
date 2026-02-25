import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo,useState } from 'react';
import { StyleSheet, Text, TextInput,TouchableOpacity, View } from 'react-native';

import AppDropdown from '@/components/AppDropdown';
import MovieGrid from '@/components/MovieGrid';
import MovieGridSkeleton from '@/components/MovieGridSkeleton';
import Screen from '@/components/Screen';
import { borderRadius, colors, fontFamily,fontSize, spacing } from '@/config';
import { genres } from '@/constants';
import { useAuth, useDebounce } from '@/hooks';
import { getGetCurrentUserQueryKey,type Movie, useGetAllMovies, useGetCurrentUser } from '@/services';
import type { SetState } from '@/types';

type SearchFiltersProps = {
  genre: string;
  selected: string;
  setGenre: SetState<string>;
  setSelected: SetState<string>;
  setSortDirection: SetState<'asc' | 'desc'>;
  sortDirection: 'asc' | 'desc';
};

const allGenres = ['Genre', ...genres] as const;

function SearchFilters({
  genre,
  selected,
  setGenre,
  setSelected,
  setSortDirection,
  sortDirection,
}: SearchFiltersProps) {
  const toggleSortDirection = () => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');

  const handleRatingPress = () => {
    if (selected === 'rating') { toggleSortDirection(); return; }
    setSelected('rating');
  };

  const handleYearPress = () => {
    if (selected === 'year') { toggleSortDirection(); return; }
    setSelected('year');
  };

  const handleAzPress = () => {
    if (selected === 'az') { toggleSortDirection(); return; }
    setSelected('az');
  };

  return (
    <View style={searchFiltersStyles.container}>
      <View style={searchFiltersStyles.underSearchContainer}>
        <View style={searchFiltersStyles.sortRow}>
          <View style={searchFiltersStyles.sortContainer}>
            <TouchableOpacity onPress={handleRatingPress} style={[searchFiltersStyles.sortBtn, searchFiltersStyles.ratingBtn, selected === 'rating' && searchFiltersStyles.activeBtn]} accessibilityRole="button" accessibilityLabel="Sort by rating">
              <Text style={searchFiltersStyles.label}>Rating</Text>
              <MaterialCommunityIcons
                name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'}
                size={20}
                color={colors.white}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleYearPress} style={[searchFiltersStyles.sortBtn, selected === 'year' && searchFiltersStyles.activeBtn]} accessibilityRole="button" accessibilityLabel="Sort by year">
              <Text style={searchFiltersStyles.label}>Year</Text>
              <MaterialCommunityIcons
                name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'}
                size={20}
                color={colors.white}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAzPress} style={[searchFiltersStyles.sortBtn, searchFiltersStyles.azBtn, selected === 'az' && searchFiltersStyles.activeBtn]} accessibilityRole="button" accessibilityLabel="Sort alphabetically">
              <Text style={searchFiltersStyles.label}>{sortDirection === 'asc' ? 'A - Z' : 'Z - A'}</Text>
            </TouchableOpacity>
          </View>
          <View style={searchFiltersStyles.genreDropdownContainer}>
            <AppDropdown
              accessibilityLabel="Filter by genre"
              buttonOpenStyle={searchFiltersStyles.genreButtonOpen}
              buttonStyle={searchFiltersStyles.genreButton}
              buttonTextStyle={genre !== 'Genre' ? searchFiltersStyles.gLabelActive : searchFiltersStyles.gLabel}
              chevronColor={colors.white}
              items={allGenres}
              itemStyle={searchFiltersStyles.genreItem}
              itemTextStyle={searchFiltersStyles.itemTextStyle}
              listStyle={searchFiltersStyles.genreList}
              onSelect={setGenre}
              overlayDropdown
              selectedValue={genre}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function SearchScreen() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState('az');
  const [genre, setGenre] = useState('Genre');

  const debouncedTitle = useDebounce(title);

  const { isAuthenticated } = useAuth();
  const { data: user } = useGetCurrentUser({
    query: {
      enabled: isAuthenticated,
      queryKey: getGetCurrentUserQueryKey(),
    },
  });
  const { data: movies = [], isLoading: loading, refetch } = useGetAllMovies();

  const displayMovies = useMemo(() => {
    const predicates = [
      (movie: Movie) => !debouncedTitle || (
        movie.title.toLowerCase().includes(debouncedTitle.toLowerCase()) ||
        movie.director.toLowerCase().includes(debouncedTitle.toLowerCase()) ||
        movie.date.includes(debouncedTitle)
      ),
      (movie: Movie) => genre === 'Genre' || movie.genres.some((g: string) => g.toLowerCase() === genre.toLowerCase()),
    ];

    const filtered = movies.filter((movie: Movie) => predicates.every(p => p(movie)));

    const sortKey: (movie: Movie) => string | number = selected === 'rating'
      ? (movie: Movie) => movie.avgRating || 0
        : selected === 'year'
      ? (movie: Movie) => new Date(movie.date).getFullYear()
        : (movie: Movie) => movie.title.toLowerCase();

    return [...filtered].sort((a, b) => {
      const aVal = sortKey(a);
      const bVal = sortKey(b);
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [genre, movies, selected, sortDirection, debouncedTitle]);

  return (
    <Screen isLoading={loading} skeleton={<MovieGridSkeleton />}>
      <View style={[searchScreenStyles.inputContainer, open && searchScreenStyles.inputContainerOpen]}>
        <TextInput
          onChangeText={setTitle}
          value={title}
          placeholder="Title, director, or year"
          placeholderTextColor={colors.medium}
          style={searchScreenStyles.text}
        />
        <TouchableOpacity style={searchScreenStyles.filtersTouchable} onPress={() => setOpen(!open)}>
          <MaterialCommunityIcons
            color={colors.medium}
            name="tune"
            size={30}
            style={searchScreenStyles.filtersBtn}
          />
        </TouchableOpacity>
      </View>
      {open && (
        <SearchFilters
          genre={genre}
          selected={selected}
          setGenre={setGenre}
          setSelected={setSelected}
          setSortDirection={setSortDirection}
          sortDirection={sortDirection}
        />
      )}
      <MovieGrid
        movies={displayMovies}
        favoriteIds={user?.favorites}
        seenIds={user?.seen}
        onRefresh={refetch}
      />
    </Screen>
  );
}

const searchFiltersStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  underSearchContainer: {
    width: '92%',
  },
  sortRow: {
    flexDirection: 'row',
    width: '100%',
  },
  sortContainer: {
    backgroundColor: colors.dark,
    borderBottomLeftRadius: borderRadius.round,
    flexDirection: 'row',
    height: 45,
    width: '70%',
    alignItems: 'center',
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.white,
  },
  gLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs + 2,
    color: colors.white,
  },
  gLabelActive: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs + 2,
    color: colors.orange,
  },
  sortBtn: {
    width: '33.33%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.white,
    borderBottomWidth: 1,
    backgroundColor: colors.black,
  },
  activeBtn: {
    backgroundColor: colors.orange,
  },
  ratingBtn: {
    borderBottomLeftRadius: borderRadius.round,
    borderLeftWidth: 1,
  },
  azBtn: {
    flexDirection: 'column',
  },
  genreDropdownContainer: {
    width: '30%',
  },
  genreButton: {
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: colors.white,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderBottomRightRadius: borderRadius.round,
    borderRadius: 0,
    backgroundColor: colors.black,
    paddingHorizontal: 0,
  },
  genreList: {
    height: 150,
    marginTop: 0,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    elevation: 5,
  },
  genreButtonOpen: {
    borderBottomRightRadius: 0,
  },
  genreItem: {
    alignItems: 'center',
    paddingVertical: fontSize.xs,
  },
  itemTextStyle: {
    fontSize: fontSize.sm,
  },
});

const searchScreenStyles = StyleSheet.create({
  inputContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.round,
    flexDirection: 'row',
    height: 45,
    justifyContent: 'space-between',
    margin: spacing.md,
    marginBottom: 0,
    paddingHorizontal: spacing.lg,
    width: '92%',
  },
  inputContainerOpen: {
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
  },
  text: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    color: 'black',
    height: 40,
    width: '80%',
  },
  filtersBtn: {
    alignSelf: 'flex-end',
  },
  filtersTouchable: {
    width: 50,
  },
});