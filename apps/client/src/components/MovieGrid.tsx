import { useCallback, useState, type ReactElement } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Movie } from '@/services';
import { colors, fontFamily, fontSize, movieCard, spacing } from '@/config';
import MovieCard from './MovieCard';
import MovieModal from './movieModal/MovieModal';
import BuyMeCoffeeButton from './BuyMeCoffeeButton';

const NUM_COLUMNS = 2;

type Props = {
  movies: Movie[];
  favoriteIds?: Set<string>;
  seenIds?: Set<string>;
  ListHeaderComponent?: ReactElement;
  ListHeaderComponentStyle?: object;
  emptyMessage?: string;
};

export default function MovieGrid({ movies, favoriteIds, seenIds, ListHeaderComponent, ListHeaderComponentStyle, emptyMessage = 'No movies found.' }: Props) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const renderMovie = useCallback(({ item }: { item: Movie }) => (
    <View style={movieCard.container}>
      <MovieCard
        movie={item}
        onPress={() => setSelectedMovie(item)}
        isFavorite={favoriteIds?.has(item._id) ?? false}
        isSeen={seenIds?.has(item._id) ?? false}
      />
    </View>
  ), [favoriteIds, seenIds]);

  const keyExtractor = useCallback((item: Movie) => item._id, []);

  return (
    <>
      <MovieModal
        isOpen={selectedMovie != null}
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
      <FlatList
        data={movies}
        renderItem={renderMovie}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeaderComponent}
        ListHeaderComponentStyle={ListHeaderComponentStyle}
        ListFooterComponent={<BuyMeCoffeeButton />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="movie-open-off-outline" size={48} color={colors.medium} />
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: spacing.lg,
  },
  columnWrapper: {
    justifyContent: 'space-evenly' as const,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: spacing.md,
  },
  emptyText: {
    color: colors.medium,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    textAlign: 'center',
  },
});
