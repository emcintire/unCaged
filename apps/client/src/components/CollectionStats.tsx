import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Movie, User } from '@/services';
import { colors, borderRadius, spacing, fontFamily, fontSize } from '@/config';

type Props = {
  seenMovies: Movie[];
  totalMovies: number;
  userRatings: User['ratings'];
};

function parseRuntime(runtime: string): number {
  const match = runtime.match(/(\d+)/);
  return match?.[1] ? parseInt(match[1], 10) : 0;
}

function formatWatchTime(totalMinutes: number): string {
  if (totalMinutes === 0) return '0m';
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getTopGenre(movies: Movie[]): string {
  const genreCounts: Record<string, number> = {};
  for (const movie of movies) {
    for (const genre of movie.genres) {
      genreCounts[genre] = (genreCounts[genre] ?? 0) + 1;
    }
  }
  let topGenre = '-';
  let maxCount = 0;
  for (const [genre, count] of Object.entries(genreCounts)) {
    if (count > maxCount) {
      maxCount = count;
      topGenre = genre;
    }
  }
  return topGenre;
}

type StatItemProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
};

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <MaterialCommunityIcons name={icon} size={20} color={colors.orange} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function CollectionStats({ seenMovies, totalMovies, userRatings }: Props) {
  const stats = useMemo(() => {
    const seenCount = seenMovies.length;
    const percentage = totalMovies > 0 ? Math.round((seenCount / totalMovies) * 100) : 0;
    const totalMinutes = seenMovies.reduce((sum, movie) => sum + parseRuntime(movie.runtime), 0);
    const watchTime = formatWatchTime(totalMinutes);
    const avgRating = userRatings.length > 0
      ? (userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length).toFixed(1)
      : '-';
    const topGenre = getTopGenre(seenMovies);

    const ratedCount = userRatings.length;

    return { seenCount, percentage, watchTime, avgRating, topGenre, ratedCount };
  }, [seenMovies, totalMovies, userRatings]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatItem icon="eye" label="Seen" value={`${stats.seenCount} / ${totalMovies}`} />
        <StatItem icon="percent" label="Complete" value={`${stats.percentage}%`} />
        <StatItem icon="clock-outline" label="Watch Time" value={stats.watchTime} />
      </View>
      <View style={styles.row}>
        <StatItem icon="counter" label="Rated" value={`${stats.ratedCount}`} />
        <StatItem icon="star" label="Avg Rating" value={stats.avgRating} />
        <StatItem icon="filmstrip" label="Top Genre" value={stats.topGenre} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.black,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  statValue: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: colors.orange,
  },
  statLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.light,
  },
});
