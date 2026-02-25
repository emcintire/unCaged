import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo,useState } from 'react';
import { StyleSheet, TextInput,TouchableOpacity, View } from 'react-native';

import MovieGrid from '@/components/MovieGrid';
import MovieGridSkeleton from '@/components/MovieGridSkeleton';
import Screen from '@/components/Screen';
import SearchFilters from '@/components/SearchFilters';
import { borderRadius, colors, fontFamily,fontSize, spacing } from '@/config';
import { useAuth, useDebounce } from '@/hooks';
import { getGetCurrentUserQueryKey,type Movie, useGetAllMovies, useGetCurrentUser } from '@/services';

const styles = StyleSheet.create({
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
      <View style={[styles.inputContainer, open && styles.inputContainerOpen]}>
        <TextInput
          onChangeText={setTitle}
          value={title}
          placeholder="Title, director, or year"
          placeholderTextColor={colors.medium}
          style={styles.text}
        />
        <TouchableOpacity style={styles.filtersTouchable} onPress={() => setOpen(!open)}>
          <MaterialCommunityIcons
            color={colors.medium}
            name="tune"
            size={30}
            style={styles.filtersBtn}
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
