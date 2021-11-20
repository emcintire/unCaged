import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

import colors from '../config/colors';

export default function Loading() {
    return (
        <View
            style={{
                backgroundColor: colors.bg,
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
            }}
        >
            <ActivityIndicator size="large" color="white" />
            <Text
                style={{
                    color: 'white',
                    fontFamily: 'Montserrat-Medium',
                    fontSize: 20,
                    marginTop: 20,
                }}
            >
                Loading...
            </Text>
        </View>
    );
}
