import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Image } from 'expo-image';
import { ScrollView } from 'react-native-gesture-handler';
import { type Movie, useCurrentUser, useAverageRating } from '@/services';
import { useAuth } from '@/hooks';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { changeResolution, colors, fontFamily, fontSize, modal, movieCard, shadow, spacing } from '@/config';
import AdBanner from '../AdBanner';
import Icon from '../Icon';
import MovieModalDetails from './MovieModalDetails';
import MovieModalActions from './MovieModalActions';
import MovieModalSignIn from './MovieModalSignIn';
import MovieModalSkeleton from '@/components/movieModal/MovieModalSkeleton';
import MovieReviews from './reviews/MovieReviews';

type Props = {
  isOpen: boolean;
  movie: Movie | null;
  onClose: () => void;
};

export default function MovieModal({ isOpen, movie: propsMovie, onClose }: Props) {
  const [movie, setMovie] = useState<Movie | null>(propsMovie);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { isAuthenticated } = useAuth();
  const { data: user } = useCurrentUser();
  const { data: ratingData, isLoading } = useAverageRating(propsMovie?._id || '');

  const movieRating = ratingData ? Number(ratingData) : 0;

  useEffect(() => {
    if (!isOpen || propsMovie == null) { return; }

    setImageLoaded(false);
    const parsedMovie = {
      ...(propsMovie.img.length === 32 ? changeResolution('h', propsMovie) : propsMovie),
    };

    setMovie(parsedMovie);
  }, [propsMovie, isOpen]);

  if (!isOpen) { return null; }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose}
    >
      <View style={styles.background}>
        {!user?.isAdmin && (
          <View style={styles.adContainerTop}>
            <AdBanner />
          </View>
        )}
        {(isLoading || movie == null) ? (
          <MovieModalSkeleton />
        ) : (
          <>
            <ScrollView
              horizontal={false}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={200}
              decelerationRate="fast"
              style={styles.container}
              pointerEvents={imageLoaded ? 'auto' : 'none'}
            >
              <View style={styles.btnContainer}>
                <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close movie details">
                  <Icon name="close" size={50} backgroundColor="transparent" iconColor={colors.white} />
                </TouchableOpacity>
              </View>
              <Image source={movie.img} style={styles.image} accessibilityLabel={`${movie.title} poster`} onLoadEnd={() => setImageLoaded(true)} />
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{movie.title}</Text>
                <View style={styles.subtitle}>
                  <View style={styles.ratingRow}>
                    <MaterialCommunityIcons name="star" size={20} color={colors.orange} style={styles.starIcon} />
                    <Text style={styles.date}>{movieRating}</Text>
                    <Text style={styles.date}> / 5</Text>
                  </View>
                  <View style={styles.ratingRow}>
                    <MaterialCommunityIcons name="calendar-blank" size={18} color={colors.white} style={styles.starIcon} />
                    <Text style={styles.date}>{movie.date?.substring(0, 4)}</Text>
                  </View>
                </View>
              </View>
              {isAuthenticated ? <MovieModalActions movie={movie} /> : <MovieModalSignIn onClose={onClose} />}
              <MovieModalDetails movie={movie} />
              <MovieReviews movieId={movie._id} />
            </ScrollView>
            {!imageLoaded && (
              <View style={styles.skeletonOverlay}>
                <MovieModalSkeleton />
              </View>
            )}
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  background: modal.background,
  container: modal.container,
  btnContainer: {
    position: 'absolute',
    right: -15,
    top: -15,
    zIndex: 10,
  },
  image: {
    ...movieCard.image,
    ...shadow.md,
    alignSelf: 'center',
    height: 320,
    marginTop: spacing.lg,
    width: 215,
  },
  titleContainer: {
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  title: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl + 4,
    textAlign: 'center',
  },
  subtitle: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: spacing.sm,
    width: '100%',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 4,
  },
  date: {
    color: colors.white,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    textAlign: 'left',
  },
  adContainerTop: {
    position: 'absolute',
    width: '100%',
    height: 'auto',
    left: 0,
    top: 0,
  },
  skeletonOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
