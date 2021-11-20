import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

import colors from '../config/colors';
import SmallLogo from '../assets/imgs/small_logo.svg';
import { View } from 'react-native';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import EmailCodeScreen from '../screens/EmailCodeScreen';
import PasswordResetScreen from '../screens/PasswordResetScreen';

const Welcome_Stack = createNativeStackNavigator();

export default function WelcomeStack() {
    return (
        <NavigationContainer>
            <View style={{ flex: 1, backgroundColor: colors.bg }}>
                <Welcome_Stack.Navigator
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: colors.black,
                        },
                        headerTintColor: '#fff',
                        headerBackTitleVisible: false,
                    }}
                >
                    <Welcome_Stack.Screen
                        name="Welcome"
                        options={{ headerTitleAlign: 'center' }}
                    >
                        {(props) => <WelcomeScreen {...props} />}
                    </Welcome_Stack.Screen>
                    <Welcome_Stack.Screen
                        name="Login"
                        options={{
                            headerTitle: (props) => (
                                <SmallLogo width={100} height={20} />
                            ),
                            headerTitleAlign: 'center',
                        }}
                    >
                        {(props) => <LoginScreen {...props} />}
                    </Welcome_Stack.Screen>
                    <Welcome_Stack.Screen
                        name="Register"
                        options={{
                            headerTitle: (props) => (
                                <SmallLogo width={110} height={20} />
                            ),
                            headerTitleAlign: 'center',
                        }}
                    >
                        {(props) => <RegisterScreen {...props} />}
                    </Welcome_Stack.Screen>
                    <Welcome_Stack.Screen
                        name="Forgot Password"
                        options={{
                            headerTitle: (props) => (
                                <SmallLogo width={110} height={20} />
                            ),
                            headerTitleAlign: 'center',
                        }}
                    >
                        {(props) => <ForgotPasswordScreen {...props} />}
                    </Welcome_Stack.Screen>
                    <Welcome_Stack.Screen
                        name="Email Code"
                        options={{
                            headerTitle: (props) => (
                                <SmallLogo width={110} height={20} />
                            ),
                            headerTitleAlign: 'center',
                        }}
                    >
                        {(props) => <EmailCodeScreen {...props} />}
                    </Welcome_Stack.Screen>
                    <Welcome_Stack.Screen
                        name="Password Reset"
                        options={{
                            headerTitle: (props) => (
                                <SmallLogo width={110} height={20} />
                            ),
                            headerTitleAlign: 'center',
                        }}
                    >
                        {(props) => <PasswordResetScreen {...props} />}
                    </Welcome_Stack.Screen>
                </Welcome_Stack.Navigator>
            </View>
        </NavigationContainer>
    );
}
