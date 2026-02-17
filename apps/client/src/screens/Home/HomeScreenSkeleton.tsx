import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Skeleton from '@/components/Skeleton';
import { borderRadius, spacing } from '@/config';

const ROWS = Array.from({ length: 4 }, (_, i) => i);
const CARDS_PER_ROW = Array.from({ length: 4 }, (_, i) => i);

const CARD_WIDTH = 135;
const CARD_HEIGHT = 200;

export default function HomeScreenSkeleton() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <View style={styles.quoteBlock}>
        <Skeleton width="80%" height={22} />
        <Skeleton width="60%" height={22} style={styles.quoteLine} />
        <Skeleton width="40%" height={14} style={styles.subquote} />
        <Skeleton width="30%" height={10} style={styles.subsubquote} />
      </View>
      {ROWS.map((row) => (
        <View key={row} style={styles.row}>
          <Skeleton width="30%" height={22} style={styles.header} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {CARDS_PER_ROW.map((card) => (
              <Skeleton
                key={card}
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                borderRadiusValue={borderRadius.sm}
                style={styles.card}
              />
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  quoteBlock: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.sm,
  },
  quoteLine: {
    marginTop: spacing.xs,
  },
  subquote: {
    marginTop: spacing.sm,
  },
  subsubquote: {
    marginTop: spacing.xs,
  },
  row: {
    marginTop: spacing.lg,
  },
  header: {
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
  },
  scrollContent: {
    marginLeft: 15,
  },
  card: {
    marginRight: spacing.sm,
  },
});
