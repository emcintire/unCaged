import { useCallback,useState } from 'react';
import { Animated } from 'react-native';

type TimingConfig = {
  duration?: number;
  useNativeDriver?: boolean;
};

/**
 * Wraps Animated.Value with simple helper methods to reduce boilerplate.
 */
export const useAnimatedValue = (initial: number) => {
  const [value] = useState(() => new Animated.Value(initial));

  const timeTo = useCallback(
    (toValue: number, config?: TimingConfig & { onDone?: () => void }) => {
      Animated.timing(value, {
        toValue,
        duration: config?.duration ?? 200,
        useNativeDriver: config?.useNativeDriver ?? true,
      }).start(config?.onDone);
    },
    [value],
  );

  const springTo = useCallback(
    (toValue: number, config?: { useNativeDriver?: boolean }) => {
      Animated.spring(value, {
        toValue,
        useNativeDriver: config?.useNativeDriver ?? true,
      }).start();
    },
    [value],
  );

  const reset = useCallback(
    (toValue: number) => {
      value.setValue(toValue);
    },
    [value],
  );

  return { value, timeTo, springTo, reset } as const;
}
