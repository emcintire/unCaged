import {
  MaterialCommunityIcons, type MaterialCommunityIcons as MaterialCommunityIconsType,
} from '@expo/vector-icons';
import { type ReactNode,useCallback } from 'react';
import type { DimensionValue,TextInputProps } from 'react-native';
import { Animated,StyleSheet, TextInput } from 'react-native';

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
    (event: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
      border.timeTo(0, { useNativeDriver: false });
      otherProps.onBlur?.(event);
    },
    [border, otherProps],
  );

  const borderColor = border.value.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.divider, colors.orange],
  });

  return (
    <Animated.View style={[styles.container, { width, borderColor }, style]}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={colors.placeholder}
          style={styles.icon}
        />
      )}
      <TextInput
        placeholderTextColor={colors.placeholder}
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
    backgroundColor: colors.surfaceFaint,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: fontSize.base,
    fontFamily: fontFamily.regular,
  },
});
