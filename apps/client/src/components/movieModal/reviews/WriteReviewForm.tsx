import { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCreateReview, useRateMovie } from '@/services';
import { borderRadius, colors, fontFamily, fontSize, spacing } from '@/config';
import StarRating from '../../StarRating';
import { logger, showErrorToast } from '@/utils';

type Props = {
  movieId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function WriteReviewForm({ movieId, onSuccess, onCancel }: Props) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isSpoiler, setIsSpoiler] = useState(false);

  const createReviewMutation = useCreateReview();
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
    try {
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

      setText('');
      setRating(null);
      setIsSpoiler(false);
      onSuccess();
    } catch (error) {
      logger.error('Failed to submit review:', error);
      showErrorToast('Failed to submit review. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Write a Review</Text>

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
          style={[styles.submitBtn, (!text.trim() || createReviewMutation.isPending) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!text.trim() || createReviewMutation.isPending}
        >
          <Text style={styles.submitText}>
            {createReviewMutation.isPending ? 'Submitting...' : 'Submit'}
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
