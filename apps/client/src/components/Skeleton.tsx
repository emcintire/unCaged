import { Animated, StyleSheet, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import { colors, borderRadius } from '@/config';
import { usePulse } from '@/hooks';

type Props = {
  width: DimensionValue;
  height: DimensionValue;
  borderRadiusValue?: number;
  style?: StyleProp<ViewStyle>;
};

export default function Skeleton({ width, height, borderRadiusValue = borderRadius.sm, style }: Props) {
  const opacity = usePulse();

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius: borderRadiusValue, opacity },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.light,
  },
});
