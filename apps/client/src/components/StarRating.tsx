import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors } from '@/config';

type Props = {
  rating: number;
  size?: number;
  gap?: number;
  color?: string;
  /** Color for unselected (outline) stars. Defaults to the same as color. */
  emptyColor?: string;
  onPress?: (star: number) => void;
};

export const getStarIcon = (star: number, rating: number): 'star' | 'star-half-full' | 'star-outline' => {
  if (rating >= star) return 'star';
  if (rating >= star - 0.5) return 'star-half-full';
  return 'star-outline';
}

export default function StarRating({
  rating,
  size = 16,
  gap = 0,
  color = colors.orange,
  emptyColor,
  onPress,
}: Props) {
  return (
    <View style={[styles.row, { gap }]}>
      {[1, 2, 3, 4, 5].map((star) => {
        const iconName = getStarIcon(star, rating);
        const iconColor = emptyColor !== undefined && iconName === 'star-outline' ? emptyColor : color;
        if (onPress) {
          return (
            <TouchableOpacity key={star} onPress={() => onPress(star)} hitSlop={8}>
              <MaterialCommunityIcons name={iconName} size={size} color={iconColor} />
            </TouchableOpacity>
          );
        }
        return <MaterialCommunityIcons key={star} name={iconName} size={size} color={iconColor} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
