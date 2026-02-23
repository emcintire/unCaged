import { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Movie } from '@/services';
import { colors, movieCard } from '@/config';
import { changeResolution } from '@/utils';

type Props = {
  movie: Movie;
  onPress: () => void;
  isFavorite?: boolean;
  isSeen?: boolean;
  buttonStyle?: ViewStyle;
};

export default function MovieCard({ movie, onPress, isFavorite = false, isSeen, buttonStyle }: Props) {
  const getImg = useCallback(() => changeResolution('l', movie).img, [movie]);

  return (
    <TouchableOpacity style={[movieCard.button, buttonStyle]} onPress={onPress}>
      <Image source={getImg()} style={movieCard.image} />
      {isFavorite && (
        <View style={styles.badge}>
          <MaterialCommunityIcons name="heart" size={14} color={colors.orange} />
        </View>
      )}
      {isSeen && (
        <View style={[styles.badge, isFavorite ? styles.secondBadge : undefined]}>
          <MaterialCommunityIcons name="eye" size={14} color={colors.orange} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.black + 'CC',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondBadge: {
    right: 34,
  },
});
