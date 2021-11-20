import React from 'react';
import { StyleSheet, View, Text, AsyncStorage } from 'react-native';
import * as Yup from 'yup';
import { useHistory } from 'react-router-native';
import { SERVER_URL} from '@env'

import Screen from '../components/Screen';
import { AppForm, AppFormField, SubmitButton } from '../components/forms';
import colors from '../config/colors';

const validationSchema = Yup.object().shape({
    name: Yup.string().required().label('Name'),
    email: Yup.string().required().email().label('Email'),
    password: Yup.string()
        .required()
        .label('Password')
        .matches(
            /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
            'Must contain 8 characters, 1 uppercase, 1 number and 1 special character'
        ),
});

function RegsisterScreen(props) {
    const history = useHistory();

    const handleSubmit = async (values) => {
        let response = await fetch(
            `${SERVER_URL}/users/`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email.toLowerCase(),
                    password: values.password,
                }),
            }
        );

        const body = await response.text();

        if (response.status !== 200) {
            alert(body);
        } else {
            await AsyncStorage.setItem('token', body);
            history.push('/home');
        }
    };

    return (
        <Screen style={styles.container}>
            <Text style={styles.tagline}>Register</Text>
            <View style={styles.formContainer}>
                <AppForm
                    initialValues={{ name: '', email: '', password: '' }}
                    onSubmit={(values) => handleSubmit(values)}
                    validationSchema={validationSchema}
                >
                    <AppFormField
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="account"
                        name="name"
                        placeholder="Name                                                 "
                        textContentType="name"
                    />
                    <AppFormField
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="email"
                        keyboardType="email-address"
                        name="email"
                        placeholder="Email                                                 "
                        textContentType="emailAddress"
                    />
                    <AppFormField
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="lock"
                        name="password"
                        placeholder="Password                                              "
                        textContentType="password"
                        secureTextEntry
                    />
                    <SubmitButton
                        title="Register"
                        style={styles.registerButton}
                    />
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
    scrollContainer: {
        height: '100%',
        width: '100%',
    },
    formContainer: {
        width: '100%',
        top: 15,
    },
    registerButton: {
        marginTop: 30,
    },
    tagline: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 40,
        marginTop: 10,
        color: 'white',
        alignSelf: 'center',
    },
});

export default RegsisterScreen;
