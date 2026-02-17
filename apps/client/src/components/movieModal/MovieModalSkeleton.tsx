import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Skeleton from '@/components/Skeleton';
import { modal, spacing } from '@/config';

const POSTER_ASPECT_RATIO = 320 / 215;

export default function MovieModalSkeleton() {
  const { width } = useWindowDimensions();
  const posterWidth = width * 0.5;
  const posterHeight = posterWidth * POSTER_ASPECT_RATIO;
  const actionSize = width * 0.14;

  return (
    <View style={styles.skeletonContainer}>
      <Skeleton width={posterWidth} height={posterHeight} />
      <Skeleton width="55%" height={24} style={styles.skeletonTitle} />
      <Skeleton width="35%" height={16} style={styles.skeletonSubtitle} />
      <View style={styles.skeletonActions}>
        <Skeleton width={actionSize} height={actionSize} borderRadiusValue={actionSize / 2} />
        <Skeleton width={actionSize} height={actionSize} borderRadiusValue={actionSize / 2} />
        <Skeleton width={actionSize} height={actionSize} borderRadiusValue={actionSize / 2} />
        <Skeleton width={actionSize} height={actionSize} borderRadiusValue={actionSize / 2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonContainer: {
    ...modal.container,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    height: '90%',
  },
  skeletonTitle: {
    marginTop: spacing.md,
  },
  skeletonSubtitle: {
    marginTop: spacing.sm,
  },
  skeletonActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: spacing.lg,
  },
});
