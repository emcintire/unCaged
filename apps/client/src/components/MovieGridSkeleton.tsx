import { StyleSheet, View } from 'react-native';

import { borderRadius, spacing } from '@/config';
import { useGridLayout } from '@/hooks';

import Skeleton from './Skeleton';

export default function MovieGridSkeleton() {
  const { numColumns, cardWidth, cardHeight, rowGap } = useGridLayout();
  const items = Array.from({ length: numColumns * 3 }, (_, i) => i);

  return (
    <View style={styles.container}>
      {items.map((i) => (
        <View key={i} style={[styles.item, { marginBottom: rowGap }]}>
          <Skeleton width={cardWidth} height={cardHeight} borderRadiusValue={borderRadius.sm} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    paddingTop: spacing.lg,
  },
  item: {
    alignItems: 'center',
  },
});
