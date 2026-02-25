import type { PropsWithChildren, ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { KeyboardAvoidingView,StyleSheet, View } from 'react-native';

import { colors } from '@/config';

import ErrorBoundary from './ErrorBoundary';
import Loading from './Loading';

type Props = PropsWithChildren & {
  isLoading?: boolean;
  skeleton?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function Screen({ children, isLoading = false, skeleton, style }: Props) {
  const loadingContent = skeleton ?? <Loading />;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
    >
      <View style={[styles.container, style]}>
        <ErrorBoundary>
          {isLoading ? loadingContent : children}
        </ErrorBoundary>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    backgroundColor: colors.bg,
    flex: 1,
    height: '100%',
    width: '100%',
  },
});
