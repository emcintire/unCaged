import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Movie } from '@/services';
import { colors, spacing, fontSize, fontFamily } from '@/config';

type Props = {
  movie: Movie;
};

export default memo(function MovieModalDetails({ movie }: Props) {
  return (
    <View style={styles.detailsContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>Genres:</Text>
        <Text style={styles.details}>{movie.genres.join(', ')}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>Age rating:</Text>
        <Text style={styles.details}>{movie.rating}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>Runtime:</Text>
        <Text style={styles.details}>{movie.runtime}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>Director:</Text>
        <Text style={styles.details}>{movie.director}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>Description:</Text>
        <Text style={styles.details}></Text>
      </View>
      <Text style={styles.description}>{movie.description}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  detailsContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxl * 2,
    alignItems: 'center',
  },
  label: {
    color: colors.white,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    marginBottom: spacing.sm,
    width: '40%',
  },
  details: {
    color: colors.white,
    fontFamily: fontFamily.light,
    fontSize: fontSize.base,
    width: '60%',
  },
  description: {
    color: colors.white,
    fontFamily: fontFamily.light,
    fontSize: fontSize.base,
    width: '95%',
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '95%',
  },
});
