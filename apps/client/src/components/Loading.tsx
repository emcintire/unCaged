import { memo } from 'react';
import { ActivityIndicator, StyleSheet,Text, View } from 'react-native';

import { colors, fontFamily, fontSize, spacing } from '@/config';

type Props = {
  visible?: boolean;
};

export default memo(function Loading({ visible = true }: Props) {
  if (!visible) { return null; }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="white" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  text: {
    color: 'white',
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    marginTop: spacing.lg,
  },
});
