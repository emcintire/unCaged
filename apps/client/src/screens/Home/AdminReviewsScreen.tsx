import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AdminReview, GetAdminReviewsParams } from '@/services';
import { useDeleteReview, useGetAdminReviews, useUnflagReview } from '@/services';
import { useDebounce } from '@/hooks';
import { borderRadius, colors, fontFamily, fontSize, spacing } from '@/config';
import Screen from '@/components/Screen';

type FilterMode = 'all' | 'flagged';

function AdminReviewItem({ item }: { item: AdminReview }) {
  const unflagMutation = useUnflagReview();
  const deleteMutation = useDeleteReview();

  const handleDelete = () => {
    Alert.alert('Delete Review', `Delete this review by ${item.userName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate({ reviewId: item._id }),
      },
    ]);
  };

  const handleUnflag = () => {
    unflagMutation.mutate({ reviewId: item._id });
  };

  const formattedDate = new Date(item.createdOn).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.reviewItem}>
      {/* Header */}
      <View style={styles.reviewHeader}>
        <View style={styles.reviewMeta}>
          <Text style={styles.movieTitle} numberOfLines={1}>{item.movieTitle}</Text>
          <Text style={styles.userInfo}>{item.userName} · {item.userEmail}</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        <View style={styles.badges}>
          {item.isFlagged && (
            <View style={styles.flagBadge}>
              <MaterialCommunityIcons name="flag" size={12} color={colors.danger} />
              <Text style={styles.flagBadgeText}>Flagged ({item.flaggedBy.length})</Text>
            </View>
          )}
          {item.isSpoiler && (
            <View style={styles.spoilerBadge}>
              <Text style={styles.spoilerBadgeText}>Spoiler</Text>
            </View>
          )}
        </View>
      </View>

      {/* Rating */}
      {item.rating != null && (
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <MaterialCommunityIcons
              key={s}
              name={s <= item.rating! ? 'star' : 'star-outline'}
              size={13}
              color={colors.orange}
            />
          ))}
        </View>
      )}

      {/* Text */}
      <Text style={styles.reviewText} numberOfLines={3}>{item.text}</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="heart" size={14} color={colors.red} />
          <Text style={styles.statText}>{item.likeCount} likes</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {item.isFlagged && (
          <TouchableOpacity
            style={styles.unflagBtn}
            onPress={handleUnflag}
            disabled={unflagMutation.isPending}
          >
            <MaterialCommunityIcons name="flag-off-outline" size={14} color={colors.green} />
            <Text style={styles.unflagText}>Unflag</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={14} color={colors.danger} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminReviewsScreen() {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchUserEmail, setSearchUserEmail] = useState('');
  const [searchMovieTitle, setSearchMovieTitle] = useState('');
  const [page, setPage] = useState(1);

  const debouncedUserEmail = useDebounce(searchUserEmail);
  const debouncedMovieTitle = useDebounce(searchMovieTitle);

  const filters: GetAdminReviewsParams = {
    page,
    flaggedOnly: filterMode === 'flagged',
    userEmail: debouncedUserEmail.trim(),
    movieTitle: debouncedMovieTitle.trim(),
  };

  const { data, isLoading, isFetching } = useGetAdminReviews(filters);

  const reviews = data?.reviews ?? [];
  const hasMore = data?.hasMore ?? false;
  const total = data?.total ?? 0;

  const handleFilterChange = (mode: FilterMode) => {
    setFilterMode(mode);
    setPage(1);
  };

  return (
    <Screen isLoading={isLoading && page === 1} style={styles.screen}>
      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(['all', 'flagged'] as Array<FilterMode>).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.chip, filterMode === mode && styles.chipActive]}
            onPress={() => handleFilterChange(mode)}
          >
            <Text style={[styles.chipText, filterMode === mode && styles.chipTextActive]}>
              {mode === 'all' ? 'All' : '🚩 Flagged'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Inputs */}
      <TextInput
        style={styles.searchInput}
        value={searchUserEmail}
        onChangeText={setSearchUserEmail}
        placeholder="Search by user email..."
        placeholderTextColor={colors.medium}
        autoCapitalize="none"
        keyboardType="email-address"
        returnKeyType="search"
      />
      <TextInput
        style={styles.searchInput}
        value={searchMovieTitle}
        onChangeText={setSearchMovieTitle}
        placeholder="Search by movie title..."
        placeholderTextColor={colors.medium}
        returnKeyType="search"
      />

      {/* Total count */}
      <Text style={styles.totalText}>
        {isFetching && page === 1 ? 'Loading...' : `${total} review${total !== 1 ? 's' : ''}`}
      </Text>

      {/* List */}
      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <AdminReviewItem item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>No reviews found.</Text>
          ) : null
        }
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={() => setPage((p) => p + 1)}
              disabled={isFetching}
            >
              <Text style={styles.loadMoreText}>
                {isFetching ? 'Loading...' : 'Load more'}
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.medium,
  },
  chipActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeBg,
  },
  chipText: {
    color: colors.medium,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  chipTextActive: {
    color: colors.orange,
  },
  searchInput: {
    backgroundColor: colors.black,
    borderRadius: borderRadius.sm,
    color: colors.white,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  totalText: {
    color: colors.medium,
    fontFamily: fontFamily.light,
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  list: {
    paddingBottom: spacing.xxl * 2,
  },
  reviewItem: {
    backgroundColor: colors.black,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  reviewMeta: {
    flex: 1,
    marginRight: spacing.sm,
  },
  movieTitle: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  userInfo: {
    color: colors.lightBlue,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  dateText: {
    color: colors.medium,
    fontFamily: fontFamily.light,
    fontSize: fontSize.xs,
  },
  badges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  flagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#3d1010',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  flagBadgeText: {
    color: colors.danger,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
  },
  spoilerBadge: {
    backgroundColor: colors.orangeBg,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  spoilerBadgeText: {
    color: colors.orange,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  reviewText: {
    color: colors.light,
    fontFamily: fontFamily.light,
    fontSize: fontSize.sm,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    color: colors.medium,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  unflagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.green,
  },
  unflagText: {
    color: colors.green,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  deleteText: {
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
  loadMoreBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.medium,
    marginTop: spacing.sm,
  },
  loadMoreText: {
    color: colors.light,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  emptyText: {
    color: colors.medium,
    fontFamily: fontFamily.light,
    fontSize: fontSize.base,
    textAlign: 'center',
    paddingTop: 40,
  },
});
