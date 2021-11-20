import React from 'react';
import { StyleSheet, View, Text, AsyncStorage } from 'react-native';
import * as Yup from 'yup';
import { SERVER_URL} from '@env'

import Screen from '../components/Screen';
import { AppForm, AppFormField, SubmitButton } from '../components/forms';
import colors from '../config/colors';

const validationSchema = Yup.object().shape({
    email: Yup.string().required().email().label('Email'),
});

const handleSubmit = async (values, props) => {
    let response = await fetch(
        `${SERVER_URL}/users/forgotPassword`,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: values.email.toLowerCase(),
            }),
        }
    );

    const body = await response.text();

    if (response.status !== 200) {
        alert(body);
    } else {
        props.navigation.navigate('Email Code');
        await AsyncStorage.setItem('token', body);
    }
};

function ForgotPasswordScreen(props) {
    return (
        <Screen style={styles.container}>
            <Text style={styles.tagline}>Reset Password</Text>
            <View style={styles.formContainer}>
                <AppForm
                    initialValues={{ email: '' }}
                    onSubmit={(values) => handleSubmit(values, props)}
                    validationSchema={validationSchema}
                    style={styles.formContainer}
                >
                    <AppFormField
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="email"
                        keyboardType="email-address"
                        name="email"
                        placeholder="Email                                  "
                        textContentType="emailAddress"
                    />
                    <SubmitButton title="Submit" style={styles.submitButton} />
                </AppForm>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: colors.bg,
        height: '100%',
        width: '100%',
        alignItems: 'center',
    },
    submitButton: {
        marginTop: 30,
    },
    formContainer: {
        width: '100%',
        top: 15,
    },
    tagline: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 30,
        marginTop: 10,
        color: 'white',
        alignSelf: 'center',
    },
});

export default ForgotPasswordScreen;
