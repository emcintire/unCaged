import { memo } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { ColorKey } from '@/types';
import { borderRadius, colors, fontFamily, fontSize, spacing } from '@/config';
import { useAnimatedValue } from '@/hooks';

type Props = {
  color?: ColorKey;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  title: string;
};

export default memo(function AppButton({
  style,
  textStyle,
  title,
  onPress,
  color = 'orange',
  disabled = false,
  loading = false,
}: Props) {
  const scale = useAnimatedValue(1);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={styles.pressable}
      onPress={onPress}
      onPressIn={() => scale.springTo(0.97)}
      onPressOut={() => scale.springTo(1)}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
    >
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: colors[color], transform: [{ scale: scale.value }] },
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Text style={[styles.text, textStyle]}>{title}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.orangeBg,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
    width: '100%',
    marginVertical: spacing.sm,
  },
  pressable: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.white,
    fontSize: fontSize.lg,
    textTransform: 'uppercase',
    fontFamily: fontFamily.extraBold,
  },
});
