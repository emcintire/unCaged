import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import MovieModalSkeleton from '@/components/movieModal/MovieModalSkeleton';
import { borderRadius, colors, fontFamily, fontSize, shadow, spacing } from '@/config';
import { useAuth } from '@/hooks';
import { type Movie, useGetAverageRating } from '@/services';
import { changeResolution } from '@/utils';

import MovieModalActions from './MovieModalActions';
import MovieModalDetails from './MovieModalDetails';
import MovieModalSignIn from './MovieModalSignIn';
import MovieReviews from './reviews/MovieReviews';

type Props = {
  isOpen: boolean;
  movie: Movie | null;
  onClose: () => void;
};

export default function MovieModal({ isOpen, movie: propsMovie, onClose }: Props) {
  const [loadedMovieId, setLoadedMovieId] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();
  const { data: rating, isLoading } = useGetAverageRating(propsMovie?._id || '');

  const movieRating = rating ? Number(rating) : 0;
  const imageLoaded = loadedMovieId === propsMovie?._id;

  const movie = useMemo(() => {
    if (propsMovie == null) return null;
    return changeResolution('w_645,f_auto,q_90', propsMovie);
  }, [propsMovie]);

  if (!isOpen) { return null; }

  return (
    <Modal animationType="fade" transparent={true} visible={isOpen} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {(isLoading || movie == null) ? (
          <View style={styles.card}>
            <MovieModalSkeleton />
          </View>
        ) : (
          <View style={styles.card}>
            <ScrollView
              contentContainerStyle={styles.content}
              decelerationRate="fast"
              pointerEvents={imageLoaded ? 'auto' : 'none'}
              scrollEventThrottle={200}
              showsVerticalScrollIndicator={false}
            >
              <Image
                source={movie.image}
                style={styles.poster}
                accessibilityLabel={`${movie.title} poster`}
                onLoadEnd={() => setLoadedMovieId(movie._id)}
              />

              <Text style={styles.title}>{movie.title}</Text>

              <View style={styles.metaRow}>
                <MaterialCommunityIcons name="star" size={14} color={colors.orange} />
                <Text style={styles.metaRating}>{movieRating}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaYear}>{movie.date?.substring(0, 4)}</Text>
              </View>

              <View style={styles.divider} />

              {isAuthenticated
                ? <MovieModalActions movie={movie} />
                : <MovieModalSignIn onClose={onClose} />
              }

              <View style={styles.divider} />

              <MovieModalDetails movie={movie} />
              <MovieReviews movieId={movie._id} />
            </ScrollView>

            {!imageLoaded && (
              <View style={[StyleSheet.absoluteFill, styles.skeletonOverlay]}>
                <MovieModalSkeleton />
              </View>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close movie details"
            >
              <MaterialCommunityIcons name="close" size={18} color={colors.light} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdropBg,
  },
  card: {
    width: '90%',
    flex: 1,
    alignSelf: 'center',
    backgroundColor: colors.bg,
    borderRadius: borderRadius.lg,
    marginVertical: 44,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceFaint,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.overlayBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    paddingHorizontal: spacing.md,
  },
  poster: {
    alignSelf: 'center',
    width: 200,
    height: 300,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadow.lg,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.white,
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.xxl,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  metaRating: {
    color: colors.orange,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
  metaDot: {
    color: colors.medium,
    fontSize: fontSize.base,
    lineHeight: 18,
  },
  metaYear: {
    color: colors.medium,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
  skeletonOverlay: {
    backgroundColor: colors.bg,
  },
});
