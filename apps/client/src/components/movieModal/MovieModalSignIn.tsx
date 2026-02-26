import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, fontSize, spacing } from '@/config';
import type { WelcomeAuthTabParamList } from '@/types';

import AppButton from '../AppButton';

type Props = {
  onClose: () => void;
};

export default function MovieModalSignIn({ onClose }: Props) {
  const navigation = useNavigation<BottomTabNavigationProp<WelcomeAuthTabParamList>>();

  const handleSignIn = () => {
    onClose();
    navigation.navigate('Welcome');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sign in to rate and track movies!</Text>
      <AppButton title="Sign In" onPress={handleSignIn} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  text: {
    color: colors.medium,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  button: {
    width: '60%',
    alignSelf: 'center',
  },
});
