import React from 'react';
import { StyleSheet, View, Text, AsyncStorage } from 'react-native';
import * as Yup from 'yup';
import { useHistory } from 'react-router-native';
import { SERVER_URL} from '@env'

import Screen from '../components/Screen';
import { AppForm, AppFormField, SubmitButton } from '../components/forms';
import colors from '../config/colors';

const validationSchema = Yup.object().shape({
    password: Yup.string()
        .required()
        .matches(
            /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
            'Must contain 8 characters, 1 uppercase, 1 number and 1 special character'
        )
        .label('Password'),
});

const handleSubmit = async (values, history) => {
    AsyncStorage.getItem('token')
        .then(async (token) => {
            let response = await fetch(
                `${SERVER_URL}/users/changePassword`,
                {
                    method: 'PUT',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'x-auth-token': token,
                    },
                    body: JSON.stringify({
                        password: values.password,
                    }),
                }
            );

            const body = await response.text();

            if (response.status !== 200) {
                alert(body);
            } else {
                props.navigation.navigate('Password Reset');
                history.push('/home');
            }
        })
        .catch((err) => {
            console.log(err);
        });
};

function PasswordResetScreen(props) {
    const history = useHistory();

    return (
        <Screen style={styles.container}>
            <Text style={styles.tagline}>New password</Text>
            <View style={styles.formContainer}>
                <AppForm
                    initialValues={{ password: '' }}
                    onSubmit={(values) => handleSubmit(values, history)}
                    validationSchema={validationSchema}
                    style={styles.formContainer}
                >
                    <AppFormField
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="lock"
                        name="password"
                        placeholder="Password                                  "
                        secureTextEntry
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

export default PasswordResetScreen;
