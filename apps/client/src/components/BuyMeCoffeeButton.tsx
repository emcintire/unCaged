import { memo } from 'react';
import { Linking, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import AppButton from './AppButton';

type Props = {
  style?: StyleProp<ViewStyle>;
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 16,
    width: '75%',
    alignSelf: 'center',
  },
});

const handlePress = () => {
  const url = 'https://www.buymeacoffee.com/greasyfingers';
  Linking.openURL(url).catch((err) =>
    console.error('Failed to open URL:', err),
  );
};

export default memo(function BuyMeCoffeeButton({ style }: Props) {
  return (
    <AppButton
      onPress={handlePress}
      style={[styles.button, style]}
      title="☕ Buy me a coffee"
    />
  );
});
