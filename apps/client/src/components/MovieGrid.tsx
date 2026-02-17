import { useCallback, useState, type ReactElement } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import type { Movie } from '@/services';
import { movieCard, spacing } from '@/config';
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
};

export default function MovieGrid({ movies, favoriteIds, seenIds, ListHeaderComponent, ListHeaderComponentStyle }: Props) {
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
});
