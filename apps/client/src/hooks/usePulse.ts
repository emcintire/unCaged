import { useEffect, useState } from 'react';
import { Animated } from 'react-native';

/**
 * Returns an Animated.Value that pulses between min and max opacity in a loop.
 */
export function usePulse(min = 0.3, max = 0.7, duration = 800) {
  const [opacity] = useState(() => new Animated.Value(min));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: max, duration, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: min, duration, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, min, max, duration]);

  return opacity;
}
