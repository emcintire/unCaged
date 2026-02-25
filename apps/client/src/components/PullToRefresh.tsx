import { useState, useCallback, forwardRef } from 'react';
import { RefreshControl, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { colors } from '@/config';

type Props = {
  onRefresh: () => Promise<unknown>;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const PullToRefresh = forwardRef<RefreshControl, Props>(function PullToRefresh(
  { onRefresh, children, style },
  ref,
) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <RefreshControl
      ref={ref}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={colors.orange}
      colors={[colors.orange]}
      style={style}
    >
      {children}
    </RefreshControl>
  );
});

export default PullToRefresh;
