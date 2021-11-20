import React, { useEffect } from 'react';
import { View } from 'react-native';
import { NativeRouter, Route } from 'react-router-native';
import { useFonts } from '@use-expo/font';

import WelcomeStack from './app/stacks/WelcomeStack';
import HomeStack from './app/stacks/HomeStack';

export default function App(props) {
    let [fontsLoaded] = useFonts({
        'Montserrat-Black': require('./app/assets/fonts/Montserrat-Black.ttf'),
        'Montserrat-Bold': require('./app/assets/fonts/Montserrat-Bold.ttf'),
        'Montserrat-ExtraBold': require('./app/assets/fonts/Montserrat-ExtraBold.ttf'),
        'Montserrat-Light': require('./app/assets/fonts/Montserrat-Light.ttf'),
        'Montserrat-ExtraLight': require('./app/assets/fonts/Montserrat-ExtraLight.ttf'),
        'Montserrat-Medium': require('./app/assets/fonts/Montserrat-Medium.ttf'),
        'Montserrat-Regular': require('./app/assets/fonts/Montserrat-Regular.ttf'),
    });

    if (fontsLoaded) {
        return (
            <NativeRouter>
                <Route exact path="/" component={WelcomeStack} />
                <Route path="/home" component={HomeStack} />
            </NativeRouter>
        );
    } else {
        return <View />;
    }
}
