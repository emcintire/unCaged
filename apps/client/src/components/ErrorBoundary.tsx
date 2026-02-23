import { Component } from 'react';
import type { ErrorInfo, PropsWithChildren } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamily, fontSize, spacing } from '@/config';
import { logger } from '@/utils';
import AppButton from './AppButton';

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>Please try again</Text>
          <AppButton title="Try Again" onPress={this.handleReset} style={styles.button} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.medium,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    marginBottom: spacing.xl,
  },
  button: {
    width: '60%',
  },
});
