import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { QueryClientProvider } from '@tanstack/react-query';
import type { RootStackParamList } from '@/types';
import { queryClient } from '@/services';
import { colors, toastConfig, layout } from '@/config';
import { AuthProvider, useAuth } from '@/hooks';
import WelcomeStack from '@/navigation/stacks/Welcome/WelcomeStack';
import HomeStack from '@/navigation/stacks/Home/HomeStack';
import { logger } from '@/utils';

SplashScreen.preventAutoHideAsync();

const loadFonts = async (): Promise<boolean> => {
  try {
    await Font.loadAsync({
      'Montserrat-ExtraLight': require('@/assets/fonts/Montserrat-ExtraLight.ttf'),
      'Montserrat-Light': require('@/assets/fonts/Montserrat-Light.ttf'),
      'Montserrat-Regular': require('@/assets/fonts/Montserrat-Regular.ttf'),
      'Montserrat-Medium': require('@/assets/fonts/Montserrat-Medium.ttf'),
      'Montserrat-Bold': require('@/assets/fonts/Montserrat-Bold.ttf'),
      'Montserrat-ExtraBold': require('@/assets/fonts/Montserrat-ExtraBold.ttf'),
      'Montserrat-Black': require('@/assets/fonts/Montserrat-Black.ttf'),
    });
    return true;
  } catch (error) {
    logger.error('Error loading fonts', error);
    return false;
  }
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Home" component={HomeStack} />
      ) : (
        <RootStack.Screen name="Auth" component={WelcomeStack} />
      )}
    </RootStack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    loadFonts().then(() => setFontsLoaded(true));
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaView style={styles.container} onLayout={onLayoutRootView} edges={['bottom', 'left', 'right']}>
          <StatusBar barStyle="light-content" backgroundColor={colors.black} translucent={false} />
          <GestureHandlerRootView style={styles.container}>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
            <Toast config={toastConfig} />
          </GestureHandlerRootView>
        </SafeAreaView>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    ...layout.container,
    backgroundColor: colors.black,
  },
});
