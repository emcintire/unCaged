import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, fontFamily, fontSize, spacing } from '@/config';
import type { Movie } from '@/services';

type Props = {
  movie: Movie;
};

const getInfoItems = (movie: Movie) => [
  { label: 'Age Rating', value: movie.rating },
  { label: 'Runtime', value: movie.runtime },
  { label: 'Director', value: movie.director },
];

export default memo(function MovieModalDetails({ movie }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.genreRow}>
        {movie.genres.map((genre) => (
          <View key={genre} style={styles.genreChip}>
            <Text style={styles.genreText}>{genre}</Text>
          </View>
        ))}
      </View>

      <View style={styles.infoGrid}>
        {getInfoItems(movie).map(({ label, value }) => (
          <View key={label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionHeader}>About</Text>
      <Text style={styles.description}>{movie.description}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: spacing.xs,
    marginBottom: spacing.xxl * 2,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceFaint,
  },
  genreChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    backgroundColor: colors.chipSurface,
  },
  genreText: {
    color: colors.light,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  infoGrid: {
    width: '100%',
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceFaint,
  },
  infoLabel: {
    color: colors.medium,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  infoValue: {
    color: colors.white,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.sm,
  },
  sectionHeader: {
    color: colors.medium,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.light,
    fontFamily: fontFamily.light,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
});
