import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { memo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import FilterChips from '@/components/FilterChips';
import WriteReviewForm from '@/components/movieModal/reviews/WriteReviewForm';
import PullToRefresh from '@/components/PullToRefresh';
import Screen from '@/components/Screen';
import { borderRadius, colors, fontFamily, fontSize, spacing } from '@/config';
import type { UserReview } from '@/services';
import { getGetMyReviewsQueryKey,useDeleteReview, useGetMyReviews } from '@/services';

const ReviewListItem = memo(({ item }: { item: UserReview }) => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteReview();

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: getGetMyReviewsQueryKey() });

  const handleDelete = () => {
    Alert.alert('Delete Review', 'Delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(
          { reviewId: item._id },
          { onSuccess: invalidate },
        ),
      },
    ]);
  };

  const formattedDate = new Date(item.createdOn).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (isEditing) {
    return (
      <WriteReviewForm
        movieId={item.movieId}
        editReviewId={item._id}
        initialText={item.text}
        initialRating={item.rating ?? null}
        initialIsSpoiler={item.isSpoiler ?? false}
        onSuccess={() => { setIsEditing(false); invalidate(); }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <View style={styles.item}>
      {/* Movie Poster */}
      <Image source={{ uri: item.movieImage }} style={styles.poster} contentFit="cover" />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.movieTitle} numberOfLines={1}>{item.movieTitle}</Text>

        {/* Rating + Likes row */}
        <View style={styles.metaRow}>
          {item.rating != null ? (
            <View style={styles.ratingRow}>
              <MaterialCommunityIcons name="star" size={14} color={colors.orange} />
              <Text style={styles.ratingText}>{item.rating}/5</Text>
            </View>
          ) : (
            <Text style={styles.noRatingText}>No rating</Text>
          )}
          <View style={styles.likesRow}>
            <MaterialCommunityIcons name="heart" size={14} color={colors.red} />
            <Text style={styles.likesText}>{item.likeCount}</Text>
          </View>
        </View>

        {/* Review Snippet */}
        <Text style={styles.reviewSnippet} numberOfLines={2}>{item.text}</Text>

        {/* Date + Edit + Delete */}
        <View style={styles.footerRow}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => setIsEditing(true)} hitSlop={8}>
              <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.medium} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} hitSlop={8} disabled={deleteMutation.isPending}>
              <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
});

type SortMode = 'recent' | 'popular';

export default function MyReviewsScreen() {
  const [sort, setSort] = useState<SortMode>('recent');
  const { data: reviews = [], isLoading, refetch } = useGetMyReviews();

  const sorted = [...reviews].sort((a, b) =>
    sort === 'popular'
      ? b.likeCount - a.likeCount
      : new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime(),
  );

  return (
    <Screen isLoading={isLoading}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ReviewListItem item={item} />}
        refreshControl={<PullToRefresh onRefresh={refetch} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <FilterChips
            options={[
              { value: 'recent', label: 'Recent' },
              { value: 'popular', label: 'Popular' },
            ]}
            selected={sort}
            onSelect={setSort}
            style={styles.sortRow}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="pencil-off-outline" size={48} color={colors.medium} />
            <Text style={styles.emptyText}>You haven&apos;t written any reviews yet.</Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: colors.black,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: borderRadius.sm,
    alignSelf: 'center',
    margin: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  movieTitle: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    color: colors.orange,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  noRatingText: {
    color: colors.medium,
    fontFamily: fontFamily.light,
    fontSize: fontSize.sm,
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  likesText: {
    color: colors.red,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  reviewSnippet: {
    color: colors.light,
    fontFamily: fontFamily.light,
    fontSize: fontSize.sm,
    lineHeight: 18,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  dateText: {
    color: colors.medium,
    fontFamily: fontFamily.light,
    fontSize: fontSize.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: spacing.md,
  },
  sortRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  emptyText: {
    color: colors.medium,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    textAlign: 'center',
  },
});
