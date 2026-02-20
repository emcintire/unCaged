import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Review } from '@/services';
import { useGetCurrentUser, useDeleteReview, useFlagReview, useToggleReviewLike } from '@/services';
import { useAuth } from '@/hooks';
import { borderRadius, colors, fontFamily, fontSize, spacing } from '@/config';
import StarRating from '../../StarRating';

type Props = {
  isOwnReview?: boolean;
  onSuccess: () => void;
  review: Review;
};

export default function ReviewCard({ isOwnReview, onSuccess, review }: Props) {
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [flagged, setFlagged] = useState(false);

  const { isAuthenticated } = useAuth();
  const { data: user } = useGetCurrentUser();

  const deleteMutation = useDeleteReview();
  const toggleLikeMutation = useToggleReviewLike();
  const flagMutation = useFlagReview();

  const canDelete = isAuthenticated && (isOwnReview || user?.isAdmin);
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
    toggleLikeMutation.mutate({ reviewId: review._id });
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

  const formattedDate = new Date(review.createdOn).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const isSpoilerHidden = review.isSpoiler && !spoilerRevealed;

  return (
    <View style={styles.card}>
      {/* Header: Avatar + Name + Date */}
      <View style={styles.header}>
        <View style={styles.avatarRow}>
          {review.userImg ? (
            <Image source={{ uri: review.userImg }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <MaterialCommunityIcons name="account" size={18} color={colors.medium} />
            </View>
          )}
          <View>
            <Text style={styles.userName}>{review.userName || 'Anonymous'}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </View>
        {canDelete && (
          <TouchableOpacity onPress={handleDelete} hitSlop={8}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>

      {/* Star Rating */}
      {review.rating != null && (
        <View style={styles.ratingRow}>
          <StarRating rating={review.rating} size={16} />
        </View>
      )}

      {/* Review Text */}
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

      {/* Footer: Like + Report */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.likeBtn}
          onPress={handleLike}
          disabled={!isAuthenticated || toggleLikeMutation.isPending}
        >
          <MaterialCommunityIcons
            name={review.isLikedByUser ? 'heart' : 'heart-outline'}
            size={18}
            color={review.isLikedByUser ? colors.red : isAuthenticated ? colors.white : colors.medium}
          />
          <Text style={[styles.likeCount, !isAuthenticated && styles.disabledText]}>
            {review.likeCount}
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
}

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
  avatarFallback: {
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
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
