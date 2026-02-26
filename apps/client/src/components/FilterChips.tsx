import { type StyleProp, StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from 'react-native';

import { borderRadius, colors, fontFamily, fontSize, spacing } from '@/config';

type ChipOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: Array<ChipOption<T>>;
  selected: T;
  onSelect: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

export default function FilterChips<T extends string>({ options, selected, onSelect, style }: Props<T>) {
  return (
    <View style={[styles.row, style]}>
      {options.map(({ value, label }) => (
        <TouchableOpacity
          key={value}
          style={[styles.chip, selected === value && styles.chipActive]}
          onPress={() => onSelect(value)}
          accessibilityRole="button"
          accessibilityState={{ selected: selected === value }}
        >
          <Text style={[styles.chipText, selected === value && styles.chipTextActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.medium,
  },
  chipActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orangeBg,
  },
  chipText: {
    color: colors.medium,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  chipTextActive: {
    color: colors.orange,
  },
});
