import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { memo, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { borderRadius, colors, fontFamily, fontSize, spacing } from '@/config';
import { getProfilePic } from '@/constants';
import { useAuth } from '@/hooks';
import type { Review } from '@/services';
import { getGetCurrentUserQueryKey, getGetReviewsByMovieQueryKey,useDeleteReview, useFlagReview, useGetCurrentUser, useToggleReviewLike } from '@/services';

import StarRating from '../../StarRating';
import WriteReviewForm from './WriteReviewForm';

type Props = {
  isOwnReview?: boolean;
  onSuccess: () => void;
  review: Review;
};

export default memo(function ReviewCard({ isOwnReview, onSuccess, review }: Props) {
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLiked, setIsLiked] = useState(review.isLikedByUser ?? false);
  const [likeCount, setLikeCount] = useState(review.likeCount);

  const { isAuthenticated } = useAuth();
  const { data: isAdmin } = useGetCurrentUser({
    query: {
      enabled: isAuthenticated,
      queryKey: getGetCurrentUserQueryKey(),
      select: (data) => data.isAdmin,
    },
  });

  const queryClient = useQueryClient();
  const deleteMutation = useDeleteReview();
  const toggleLikeMutation = useToggleReviewLike();
  const flagMutation = useFlagReview();

  const canDelete = isAuthenticated && (isOwnReview || isAdmin);
  const canEdit = isAuthenticated && isOwnReview;
  const canReport = isAuthenticated && !isOwnReview && !flagged;

  const handleDelete = () => {
    Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate({ reviewId: review._id }, { onSuccess }),
      },
    ]);
  };

  const handleLike = () => {
    if (!isAuthenticated) return;
    const prevLiked = isLiked;
    const prevCount = likeCount;
    const newLiked = !prevLiked;
    const newCount = prevCount + (prevLiked ? -1 : 1);
    setIsLiked(newLiked);
    setLikeCount(newCount);
    toggleLikeMutation.mutate(
      { reviewId: review._id },
      {
        onSuccess: () => {
          queryClient.setQueriesData<{ reviews: Array<Review>; hasMore: boolean; total: number }>(
            { queryKey: getGetReviewsByMovieQueryKey() },
            (old) => {
              if (!old) return old;
              return {
                ...old,
                reviews: old.reviews.map((r) =>
                  r._id === review._id ? { ...r, isLikedByUser: newLiked, likeCount: newCount } : r,
                ),
              };
            },
          );
        },
        onError: () => { setIsLiked(prevLiked); setLikeCount(prevCount); },
      },
    );
  };

  const handleFlag = () => {
    Alert.alert('Report Review', 'Report this review as inappropriate?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        onPress: () => {
          flagMutation.mutate({ reviewId: review._id });
          setFlagged(true);
        },
      },
    ]);
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    onSuccess();
  };

  const formattedDate = useMemo(() => new Date(review.createdOn).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }), [review.createdOn]);

  const isSpoilerHidden = review.isSpoiler && !spoilerRevealed;

  if (isEditing) {
    return (
      <WriteReviewForm
        movieId={review.movieId}
        editReviewId={review._id}
        initialText={review.text}
        initialRating={review.rating ?? null}
        initialIsSpoiler={review.isSpoiler ?? false}
        onSuccess={handleEditSuccess}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarRow}>
          <Image source={getProfilePic(review.userImage)} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{review.userName || 'Anonymous'}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {canEdit && (
            <TouchableOpacity onPress={() => setIsEditing(true)} hitSlop={8}>
              <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.medium} />
            </TouchableOpacity>
          )}
          {canDelete && (
            <TouchableOpacity onPress={handleDelete} hitSlop={8}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {review.rating != null && (
        <View style={styles.ratingRow}>
          <StarRating rating={review.rating} size={16} />
        </View>
      )}

      {isSpoilerHidden ? (
        <TouchableOpacity style={styles.spoilerBox} onPress={() => setSpoilerRevealed(true)}>
          <MaterialCommunityIcons name="eye-off" size={16} color={colors.medium} />
          <Text style={styles.spoilerText}>Contains spoilers — tap to reveal</Text>
        </TouchableOpacity>
      ) : (
        <>
          {review.isSpoiler && (
            <TouchableOpacity onPress={() => setSpoilerRevealed(false)} style={styles.spoilerBadge}>
              <Text style={styles.spoilerBadgeText}>⚠ Spoiler</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.reviewText}>{review.text}</Text>
        </>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.likeBtn}
          onPress={handleLike}
          disabled={!isAuthenticated || toggleLikeMutation.isPending}
        >
          <MaterialCommunityIcons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={isLiked ? colors.red : isAuthenticated ? colors.white : colors.medium}
          />
          <Text style={[styles.likeCount, !isAuthenticated && styles.disabledText]}>
            {likeCount}
          </Text>
        </TouchableOpacity>

        {canReport && (
          <TouchableOpacity onPress={handleFlag} hitSlop={8}>
            <MaterialCommunityIcons name="flag-outline" size={18} color={colors.medium} />
          </TouchableOpacity>
        )}
        {flagged && (
          <Text style={styles.flaggedText}>Reported</Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.black,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
userName: {
    color: colors.white,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  date: {
    color: colors.medium,
    fontFamily: fontFamily.light,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  reviewText: {
    color: colors.light,
    fontFamily: fontFamily.light,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  spoilerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bg,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  spoilerText: {
    color: colors.medium,
    fontFamily: fontFamily.light,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },
  spoilerBadge: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  spoilerBadgeText: {
    color: colors.orange,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    color: colors.white,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  disabledText: {
    color: colors.medium,
  },
  flaggedText: {
    color: colors.medium,
    fontFamily: fontFamily.light,
    fontSize: fontSize.xs,
    fontStyle: 'italic',
  },
});
