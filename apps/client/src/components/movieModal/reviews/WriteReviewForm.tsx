import { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCreateReview, useRateMovie, useUpdateReview } from '@/services';
import { borderRadius, colors, fontFamily, fontSize, spacing } from '@/config';
import StarRating from '../../StarRating';

type Props = {
  movieId: string;
  onSuccess: () => void;
  onCancel: () => void;
  editReviewId?: string;
  initialText?: string;
  initialRating?: number | null;
  initialIsSpoiler?: boolean;
};

export default function WriteReviewForm({
  movieId,
  onSuccess,
  onCancel,
  editReviewId,
  initialText = '',
  initialRating = null,
  initialIsSpoiler = false,
}: Props) {
  const [text, setText] = useState(initialText);
  const [rating, setRating] = useState<number | null>(initialRating ?? null);
  const [isSpoiler, setIsSpoiler] = useState(initialIsSpoiler);

  const isEditMode = editReviewId != null;

  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();
  const rateMovieMutation = useRateMovie();

  const handleStarPress = (star: number) => {
    if (rating === star) {
      setRating(star - 0.5);
    } else if (rating === star - 0.5) {
      setRating(null);
    } else {
      setRating(star);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    if (isEditMode) {
      await updateReviewMutation.mutateAsync({
        reviewId: editReviewId,
        data: {
          text: text.trim(),
          ...(rating != null && { rating }),
          isSpoiler,
        },
      });
    } else {
      await createReviewMutation.mutateAsync({
        data: {
          movieId,
          text: text.trim(),
          ...(rating != null && { rating }),
          isSpoiler,
        },
      });

      if (rating != null) {
        await rateMovieMutation.mutateAsync({ data: { id: movieId, rating } });
      }
    }

    onSuccess();
  };

  const isPending = isEditMode
    ? updateReviewMutation.isPending
    : createReviewMutation.isPending;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>{isEditMode ? 'Edit Review' : 'Write a Review'}</Text>

      {/* Star Rating Selector */}
      <View style={styles.starRow}>
        <Text style={styles.label}>Rating (optional):</Text>
        <StarRating
          rating={rating ?? 0}
          size={26}
          gap={4}
          onPress={handleStarPress}
        />
      </View>

      {/* Review Text Input */}
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Share your thoughts about this movie..."
        placeholderTextColor={colors.medium}
        multiline
        maxLength={2048}
        textAlignVertical="top"
      />
      <Text style={styles.charCount}>{text.length}/2048</Text>

      {/* Spoiler Toggle */}
      <View style={styles.spoilerRow}>
        <Text style={styles.label}>Mark as spoiler?</Text>
        <Switch
          value={isSpoiler}
          onValueChange={setIsSpoiler}
          trackColor={{ false: colors.medium, true: colors.orange }}
          thumbColor={colors.white}
        />
      </View>

      {/* Actions */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, (!text.trim() || isPending) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!text.trim() || isPending}
        >
          <Text style={styles.submitText}>
            {isPending ? 'Saving...' : isEditMode ? 'Save' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.black,
    borderRadius: borderRadius.sm,
    width: '100%',
  },
  sectionLabel: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.light,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.bg,
    borderRadius: borderRadius.sm,
    color: colors.white,
    fontFamily: fontFamily.light,
    fontSize: fontSize.md,
    minHeight: 100,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  charCount: {
    color: colors.medium,
    fontFamily: fontFamily.light,
    fontSize: fontSize.xs,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  spoilerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: borderRadius.round,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.medium,
  },
  cancelText: {
    color: colors.light,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: colors.orange,
    borderRadius: borderRadius.round,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: colors.medium,
  },
  submitText: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
});
