import { useCallback, type ReactNode } from 'react';
import { TextInput, StyleSheet, Animated } from 'react-native';
import type { TextInputProps, DimensionValue } from 'react-native';
import {
  MaterialCommunityIcons, type MaterialCommunityIcons as MaterialCommunityIconsType,
} from '@expo/vector-icons';
import { borderRadius, colors, fontFamily, fontSize, spacing } from '@/config';
import { useAnimatedValue } from '@/hooks';

type Props = TextInputProps & {
  icon?: keyof typeof MaterialCommunityIconsType.glyphMap | undefined;
  rightElement?: ReactNode;
  width?: DimensionValue;
};

export default function AppTextInput({ icon, rightElement, width = '100%', style, ...otherProps }: Props) {
  const border = useAnimatedValue(0);

  const handleFocus = useCallback(() => {
    border.timeTo(1, { useNativeDriver: false });
  }, [border]);

  const handleBlur = useCallback(
    (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
      border.timeTo(0, { useNativeDriver: false });
      otherProps.onBlur?.(e);
    },
    [border, otherProps.onBlur],
  );

  const borderColor = border.value.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', colors.orange],
  });

  return (
    <Animated.View style={[styles.container, { width, borderColor }, style]}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={colors.medium}
          style={styles.icon}
        />
      )}
      <TextInput
        placeholderTextColor={colors.medium}
        style={styles.input}
        accessibilityLabel={otherProps.placeholder}
        {...otherProps}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {rightElement}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.light,
    borderRadius: borderRadius.round,
    borderWidth: 1.5,
    borderColor: 'transparent',
    flexDirection: 'row',
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.dark,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.regular,
  },
});
