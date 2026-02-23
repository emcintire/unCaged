import { useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';
import AppText from '../AppText';
import { typography } from '@/config';
import { useAnimatedValue } from '@/hooks';

type Props = {
  error?: string | string[];
  visible?: boolean;
};

export default function ErrorMessage({ error, visible }: Props) {
  const fade = useAnimatedValue(0);
  const slide = useAnimatedValue(-4);

  useEffect(() => {
    if (visible && error) {
      fade.timeTo(1);
      slide.timeTo(0);
    } else {
      fade.reset(0);
      slide.reset(-4);
    }
  }, [visible, error, fade, slide]);

  if (!visible || !error) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fade.value, transform: [{ translateY: slide.value }] }]}>
      <AppText style={typography.error}>{error}</AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
