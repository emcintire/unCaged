import { StyleSheet, View } from 'react-native';

import Skeleton from '@/components/Skeleton';
import { borderRadius, colors, spacing } from '@/config';

const ACTIONS = [0, 1, 2, 3];
const DETAIL_LINES = ['80%', '60%', '70%'] as const;

export default function MovieModalSkeleton() {
  return (
    <View style={styles.content}>
        <Skeleton width={200} height={300} borderRadiusValue={borderRadius.md} />

        <Skeleton width="55%" height={28} style={styles.title} />
        <Skeleton width="30%" height={14} style={styles.meta} />

        <View style={styles.divider} />

        <View style={styles.actionsRow}>
          {ACTIONS.map((i) => (
            <View key={i} style={styles.actionItem}>
              <Skeleton width={48} height={48} borderRadiusValue={24} />
              <Skeleton width={36} height={9} style={styles.actionLabel} />
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsBlock}>
          {DETAIL_LINES.map((w, i) => (
            <Skeleton key={i} width={w} height={12} style={styles.detailLine} />
          ))}
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  title: {
    marginTop: spacing.md,
  },
  meta: {
    marginTop: spacing.xs,
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingVertical: spacing.xs,
  },
  actionItem: {
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: {
    borderRadius: 4,
  },
  detailsBlock: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  detailLine: {
    borderRadius: 4,
  },
});
