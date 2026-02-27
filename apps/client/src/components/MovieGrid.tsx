import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type ReactElement,type ReactNode, useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text,View } from 'react-native';

import { colors, fontFamily, fontSize, spacing } from '@/config';
import { useGridLayout } from '@/hooks';
import type { Movie } from '@/services';

import BuyMeCoffeeButton from './BuyMeCoffeeButton';
import MovieCard from './MovieCard';
import MovieModal from './movieModal/MovieModal';
import PullToRefresh from './PullToRefresh';

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
  const { numColumns, cardWidth, cardHeight, rowGap } = useGridLayout();

  const cardButtonStyle = useMemo(() => ({ width: cardWidth, height: cardHeight }), [cardWidth, cardHeight]);
  const cardWrapperStyle = useMemo(() => [styles.cardWrapper, { marginBottom: rowGap }], [rowGap]);

  const renderMovie = useCallback(({ item }: { item: Movie }) => (
    <View style={cardWrapperStyle}>
      <MovieCard
        movie={item}
        onPress={() => setSelectedMovie(item)}
        isFavorite={favoriteIds.includes(item._id)}
        isSeen={seenIds.includes(item._id)}
        buttonStyle={cardButtonStyle}
      />
    </View>
  ), [favoriteIds, seenIds, cardButtonStyle, cardWrapperStyle]);

  const keyExtractor = useCallback((item: Movie) => item._id, []);

  return (
    <>
      <MovieModal
        isOpen={selectedMovie != null}
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
      <FlatList
        key={`grid-${numColumns}`}
        data={movies}
        renderItem={renderMovie}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={{ paddingTop: rowGap }}
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
  cardWrapper: {
    alignItems: 'center',
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
