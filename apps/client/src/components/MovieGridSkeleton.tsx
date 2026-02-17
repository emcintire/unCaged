import { View, StyleSheet } from 'react-native';
import { borderRadius, movieCard, spacing } from '@/config';
import Skeleton from './Skeleton';

const ITEMS = Array.from({ length: 6 }, (_, i) => i);

export default function MovieGridSkeleton() {
  return (
    <View style={styles.container}>
      {ITEMS.map((i) => (
        <View key={i} style={styles.item}>
          <Skeleton width={movieCard.button.width} height={movieCard.button.height} borderRadiusValue={borderRadius.sm} />
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
    marginBottom: spacing.lg,
  },
});
