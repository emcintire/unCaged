import React from 'react';
import { StyleSheet, View, Text, AsyncStorage } from 'react-native';
import * as Yup from 'yup';
import { SERVER_URL} from '@env'

import Screen from '../components/Screen';
import { AppForm, AppFormField, SubmitButton } from '../components/forms';
import colors from '../config/colors';

const validationSchema = Yup.object().shape({
    code: Yup.string().required().label('Code'),
});

function EmailCodeScreen(props) {
    const handleSubmit = async (values) => {
        AsyncStorage.getItem('token')
            .then(async (token) => {
                let response = await fetch(
                    `${SERVER_URL}/users/checkCode`,
                    {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            'x-auth-token': token,
                        },
                        body: JSON.stringify({
                            code: values.code,
                        }),
                    }
                );

                const body = await response.text();

                if (response.status !== 200) {
                    alert(body);
                } else {
                    props.navigation.navigate('Password Reset');
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <Screen style={styles.container}>
            <Text style={styles.tagline}>Check Email</Text>
            <View style={styles.formContainer}>
                <AppForm
                    initialValues={{ code: '' }}
                    onSubmit={(values) => handleSubmit(values)}
                    validationSchema={validationSchema}
                    style={styles.formContainer}
                >
                    <AppFormField
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="lock"
                        name="code"
                        placeholder="Enter Code                                  "
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

export default EmailCodeScreen;
