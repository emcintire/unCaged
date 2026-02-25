import { memo } from 'react';
import { StyleSheet,View } from 'react-native';

import { colors } from '@/config';

type SeparatorProps = {
  modal?: boolean;
};

export default memo(function Separator({ modal }: SeparatorProps) {
  return (
    <View style={[styles.separator, { backgroundColor: modal ? colors.light : colors.bg }]} />
  );
});

const styles = StyleSheet.create({
  separator: {
    width: '100%',
    height: 1,
  },
});
