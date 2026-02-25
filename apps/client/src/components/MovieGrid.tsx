import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type ReactElement,type ReactNode, useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text,View } from 'react-native';

import { colors, fontFamily, fontSize, movieCard, spacing } from '@/config';
import type { Movie } from '@/services';

import BuyMeCoffeeButton from './BuyMeCoffeeButton';
import MovieCard from './MovieCard';
import MovieModal from './movieModal/MovieModal';
import PullToRefresh from './PullToRefresh';

const NUM_COLUMNS = 2;

type Props = {
  movies: Array<Movie>;
  favoriteIds?: Array<string> | undefined;
  seenIds?: Array<string> | undefined;
  ListHeaderComponent?: ReactElement | null;
  ListHeaderComponentStyle?: object;
  emptyMessage?: ReactNode;
  onRefresh?: () => Promise<unknown>;
};

export default function MovieGrid({
  movies,
  favoriteIds = [],
  seenIds = [],
  ListHeaderComponent,
  ListHeaderComponentStyle,
  emptyMessage = 'No results :(',
  onRefresh,
}: Props) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const renderMovie = useCallback(({ item }: { item: Movie }) => (
    <View style={movieCard.container}>
      <MovieCard
        movie={item}
        onPress={() => setSelectedMovie(item)}
        isFavorite={favoriteIds.includes(item._id)}
        isSeen={seenIds.includes(item._id)}
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
        refreshControl={onRefresh ? <PullToRefresh onRefresh={onRefresh} /> : undefined}
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
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  emptyText: {
    color: colors.medium,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    textAlign: 'center',
  },
});
