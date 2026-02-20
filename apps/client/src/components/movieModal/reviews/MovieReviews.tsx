import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Review } from '@/services';
import { useGetCurrentUser, useGetReviewsByMovie } from '@/services';
import { useAuth } from '@/hooks';
import { borderRadius, colors, fontFamily, fontSize, spacing } from '@/config';
import WriteReviewForm from './WriteReviewForm';
import ReviewCard from './ReviewCard';

type Props = {
  movieId: string;
};

export default function MovieReviews({ movieId }: Props) {
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');
  const [page, setPage] = useState(1);
  const [accumulatedReviews, setAccumulatedReviews] = useState<Review[]>([]);
  const [showWriteForm, setShowWriteForm] = useState(false);

  const { isAuthenticated } = useAuth();
  const { data: user } = useGetCurrentUser();
  const { data: reviews, isLoading, isFetching, refetch } = useGetReviewsByMovie({ movieId, page, sort });

  const prevSortRef = useRef(sort);

  // Accumulate reviews as pages load; reset on sort change
  useEffect(() => {
    if (!reviews) return;

    if (prevSortRef.current !== sort) {
      // Sort changed — replace all
      setAccumulatedReviews(reviews.reviews);
      prevSortRef.current = sort;
    } else {
      // Same sort, new page — append unique reviews
      setAccumulatedReviews((prev) => {
        const existingIds = new Set(prev.map((r) => r._id));
        const newOnes = reviews.reviews.filter((r) => !existingIds.has(r._id));
        return page === 1 ? reviews.reviews : [...prev, ...newOnes];
      });
    }
  }, [reviews, sort, page]);

  const handleSortChange = (newSort: 'recent' | 'popular') => {
    if (newSort === sort) return;
    setPage(1);
    setSort(newSort);
  };

  const handleLoadMore = () => {
    setPage((p) => p + 1);
  };

  const ownReviews = isAuthenticated
    ? accumulatedReviews.filter((r) => r.userId === user?._id)
    : [];

  const otherReviews = accumulatedReviews.filter((r) => r.userId !== user?._id);
  const hasMore = reviews?.hasMore ?? false;
  const total = reviews?.total ?? 0;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>
          Reviews {total > 0 ? `(${total})` : ''}
        </Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[styles.sortBtn, sort === 'recent' && styles.sortBtnActive]}
            onPress={() => handleSortChange('recent')}
          >
            <Text style={[styles.sortText, sort === 'recent' && styles.sortTextActive]}>Recent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sort === 'popular' && styles.sortBtnActive]}
            onPress={() => handleSortChange('popular')}
          >
            <Text style={[styles.sortText, sort === 'popular' && styles.sortTextActive]}>Popular</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Your Reviews (pinned at top) */}
      {isAuthenticated && ownReviews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your Reviews</Text>
          {ownReviews.map((review) => (
            <ReviewCard key={review._id} onSuccess={refetch} review={review} isOwnReview />
          ))}
        </View>
      )}

      {/* Write Review */}
      {isAuthenticated && !showWriteForm && (
        <TouchableOpacity style={styles.writeBtn} onPress={() => setShowWriteForm(true)}>
          <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.orange} />
          <Text style={styles.writeBtnText}>Write a Review</Text>
        </TouchableOpacity>
      )}
      {isAuthenticated && showWriteForm && (
        <WriteReviewForm
          movieId={movieId}
          onSuccess={() => {
            setShowWriteForm(false);
            refetch();
          }}
          onCancel={() => setShowWriteForm(false)}
        />
      )}

      {/* Sign-in prompt */}
      {!isAuthenticated && (
        <Text style={styles.signInPrompt}>Sign in to like or write a review</Text>
      )}

      {/* Community Reviews */}
      {otherReviews.length > 0 && (
        <View style={styles.section}>
          {isAuthenticated && ownReviews.length > 0 && (
            <Text style={styles.sectionLabel}>Community Reviews</Text>
          )}
          {otherReviews.map((review) => (
            <ReviewCard
              key={review._id}
              onSuccess={refetch}
              review={review}
              isOwnReview={false}
            />
          ))}
        </View>
      )}

      {/* Loading / Empty states */}
      {isLoading && page === 1 && (
        <Text style={styles.statusText}>Loading reviews...</Text>
      )}
      {!isLoading && accumulatedReviews.length === 0 && (
        <Text style={styles.statusText}>No reviews yet. Be the first!</Text>
      )}

      {/* Load More */}
      {hasMore && (
        <TouchableOpacity
          style={styles.loadMoreBtn}
          onPress={handleLoadMore}
          disabled={isFetching}
        >
          <Text style={styles.loadMoreText}>
            {isFetching ? 'Loading...' : 'Load more reviews'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    paddingBottom: 60,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heading: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sortBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.medium,
  },
  sortBtnActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeBg,
  },
  sortText: {
    color: colors.medium,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
  sortTextActive: {
    color: colors.orange,
  },
  section: {
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    color: colors.medium,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  writeBtnText: {
    color: colors.orange,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
  },
  signInPrompt: {
    color: colors.medium,
    fontFamily: fontFamily.light,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  statusText: {
    color: colors.medium,
    fontFamily: fontFamily.light,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  loadMoreBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.medium,
  },
  loadMoreText: {
    color: colors.light,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
});
