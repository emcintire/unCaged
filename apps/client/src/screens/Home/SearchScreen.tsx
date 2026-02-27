import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import AppDropdown from '@/components/AppDropdown';
import MovieGrid from '@/components/MovieGrid';
import MovieGridSkeleton from '@/components/MovieGridSkeleton';
import Screen from '@/components/Screen';
import { borderRadius, colors, fontFamily, fontSize, spacing } from '@/config';
import { genres } from '@/constants';
import { useAuth, useDebounce } from '@/hooks';
import { getGetCurrentUserQueryKey, type Movie, useGetAllMovies, useGetCurrentUser } from '@/services';
import type { SetState } from '@/types';

type SortKey = 'az' | 'rating' | 'year';

type SearchFiltersProps = {
  genre: string;
  selected: SortKey;
  setGenre: SetState<string>;
  setSelected: SetState<SortKey>;
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
  const toggleSortDirection = () => setSortDirection(d => d === 'asc' ? 'desc' : 'asc');

  const handleSortPress = (key: SortKey) => {
    if (selected === key) { toggleSortDirection(); return; }
    setSelected(key);
  };

  const arrowIcon = sortDirection === 'asc' ? 'arrow-up' : 'arrow-down';

  return (
    <View style={sf.container}>
      <View style={sf.sortRow}>
        <View style={sf.sortContainer}>
          <TouchableOpacity
            onPress={() => handleSortPress('rating')}
            style={[sf.sortBtn, sf.ratingBtn, selected === 'rating' && sf.activeBtn]}
            accessibilityRole="button"
            accessibilityLabel="Sort by rating"
          >
            <Text style={sf.label}>Rating</Text>
            <MaterialCommunityIcons name={arrowIcon} size={20} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSortPress('year')}
            style={[sf.sortBtn, selected === 'year' && sf.activeBtn]}
            accessibilityRole="button"
            accessibilityLabel="Sort by year"
          >
            <Text style={sf.label}>Year</Text>
            <MaterialCommunityIcons name={arrowIcon} size={20} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSortPress('az')}
            style={[sf.sortBtn, selected === 'az' && sf.activeBtn]}
            accessibilityRole="button"
            accessibilityLabel="Sort alphabetically"
          >
            <Text style={sf.label}>{sortDirection === 'asc' ? 'A – Z' : 'Z – A'}</Text>
          </TouchableOpacity>
        </View>
        <View style={sf.genreDropdownContainer}>
          <AppDropdown
            accessibilityLabel="Filter by genre"
            buttonOpenStyle={sf.genreButtonOpen}
            buttonStyle={sf.genreButton}
            buttonTextStyle={genre !== 'Genre' ? sf.gLabelActive : sf.gLabel}
            items={allGenres}
            itemStyle={sf.genreItem}
            itemTextStyle={sf.itemText}
            listStyle={sf.genreList}
            onSelect={setGenre}
            overlayDropdown
            selectedValue={genre}
          />
        </View>
      </View>
    </View>
  );
}

export default function SearchScreen() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<SortKey>('az');
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
    const matchesTitle = (movie: Movie) =>
      !debouncedTitle ||
      movie.title.toLowerCase().includes(debouncedTitle.toLowerCase()) ||
      movie.director.toLowerCase().includes(debouncedTitle.toLowerCase()) ||
      movie.date.includes(debouncedTitle);

    const matchesGenre = (movie: Movie) =>
      genre === 'Genre' || movie.genres.some((g: string) => g.toLowerCase() === genre.toLowerCase());

    const filtered = movies.filter((movie: Movie) => matchesTitle(movie) && matchesGenre(movie));

    const sortKey = (movie: Movie): string | number => {
      if (selected === 'rating') return movie.avgRating || 0;
      if (selected === 'year') return new Date(movie.date).getFullYear();
      return movie.title.toLowerCase();
    };

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
      <View style={[ss.inputContainer, open && ss.inputContainerOpen]}>
        <TextInput
          onChangeText={setTitle}
          value={title}
          placeholder="Title, director, or year"
          placeholderTextColor={colors.placeholder}
          style={ss.text}
        />
        <TouchableOpacity style={ss.filtersTouchable} onPress={() => setOpen(!open)}>
          <MaterialCommunityIcons
            color={colors.placeholder}
            name="tune"
            size={30}
            style={ss.filtersBtn}
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

const sf = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: '92%',
  },
  sortRow: {
    flexDirection: 'row',
    width: '100%',
  },
  sortContainer: {
    borderBottomLeftRadius: borderRadius.round,
    flexDirection: 'row',
    height: 45,
    width: '70%',
    alignItems: 'center',
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.white,
  },
  gLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.white,
  },
  gLabelActive: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.orange,
  },
  sortBtn: {
    width: '33.33%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.divider,
    borderBottomWidth: 1,
    backgroundColor: colors.bg,
  },
  activeBtn: {
    backgroundColor: colors.orange,
  },
  ratingBtn: {
    borderBottomLeftRadius: borderRadius.round,
    borderLeftWidth: 1,
  },
  genreDropdownContainer: {
    width: '30%',
  },
  genreButton: {
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: colors.divider,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderBottomRightRadius: borderRadius.round,
    borderRadius: 0,
    backgroundColor: colors.bg,
    paddingHorizontal: 0,
  },
  genreList: {
    height: 150,
    marginTop: 0,
    backgroundColor: colors.bg,
    borderRadius: borderRadius.md,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.divider,
    elevation: 5,
  },
  genreButtonOpen: {
    borderBottomRightRadius: 0,
  },
  genreItem: {
    alignItems: 'center',
    paddingVertical: fontSize.xs,
  },
  itemText: {
    fontSize: fontSize.sm,
  },
});

const ss = StyleSheet.create({
  inputContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceFaint,
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
    color: colors.white,
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
