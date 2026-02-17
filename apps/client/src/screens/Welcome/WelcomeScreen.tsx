import { StyleSheet, Text, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Logo from '@/assets/imgs/logo.svg';
import type { WelcomeAuthTabParamList } from '@/types';
import { colors, fontFamily, spacing } from '@/config';
import AppButton from '@/components/AppButton';
import Screen from '@/components/Screen';

export default function WelcomeScreen() {
  const { navigate } = useNavigation<NativeStackNavigationProp<WelcomeAuthTabParamList>>();
  const { height } = useWindowDimensions();
  const logoSize = Math.min(height * 0.28, 240);

  return (
    <Screen style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo width={logoSize * (260 / 240)} height={logoSize} />
      </View>
      <View style={styles.buttonContainer}>
        <AppButton
          title="SIGN IN"
          color="darkOrange"
          onPress={() => navigate('Sign In')}
        />
        <AppButton
          title="SIGN UP"
          color="orange"
          onPress={() => navigate('Sign Up')}
        />
        <TouchableOpacity
          style={styles.forgotButton}
          onPress={() => navigate('Forgot Password')}
          accessibilityRole="button"
          accessibilityLabel="Forgot Password"
        >
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  buttonContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: '50%',
    width: '60%',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '50%',
  },
  forgot: {
    fontFamily: fontFamily.regular,
    color: colors.white,
  },
  forgotButton: {
    marginTop: spacing.sm,
  },
});
