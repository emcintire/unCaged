import React from 'react';
import { StyleSheet, View, Text, AsyncStorage } from 'react-native';
import * as Yup from 'yup';
import { SERVER_URL} from '@env'

import Screen from '../components/Screen';
import { AppForm, AppFormField, SubmitButton } from '../components/forms';
import colors from '../config/colors';

const handleSubmit = async (values, props) => {
    if (values.newPassword !== values.confirmPassword)
        return alert('Passwords do not match');

    if (values.newPassword === values.currentPassword)
        return alert('New password must be different from current password');

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
                        currentPassword: values.currentPassword,
                        password: values.newPassword,
                    }),
                }
            );

            const body = await response.text();

            if (response.status !== 200) {
                alert(body);
            } else {
                alert('Password updated!');
                props.navigation.navigate('Settings');
            }
        })
        .catch((err) => {
            console.log(err);
        });
};

function SecurityScreen(props) {
    return (
        <Screen style={styles.container}>
            <Text style={styles.tagline}>Change Password</Text>
            <View style={styles.formContainer}>
                <AppForm
                    initialValues={{
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                    }}
                    onSubmit={(values) => handleSubmit(values, props)}
                    validationSchema={validationSchema}
                >
                    <View style={{ marginBottom: 20 }}>
                        <AppFormField
                            autoCapitalize="none"
                            autoCorrect={false}
                            icon="lock"
                            name="currentPassword"
                            placeholder="Current Password                                  "
                            textContentType="password"
                            secureTextEntry
                        />
                    </View>
                    <AppFormField
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="lock"
                        name="newPassword"
                        placeholder="New Password                                  "
                        textContentType="password"
                        secureTextEntry
                    />
                    <AppFormField
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="lock"
                        name="confirmPassword"
                        placeholder="Confirm New Password                                  "
                        textContentType="password"
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
        paddingTop: 5,
    },
    scrollContainer: {
        height: '100%',
        width: '100%',
    },
    formContainer: {
        width: '100%',
        top: 15,
    },
    submitButton: {
        marginTop: 30,
    },
    tagline: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 25,
        marginTop: 10,
        color: 'white',
        alignSelf: 'center',
    },
});

const validationSchema = Yup.object().shape({
    currentPassword: Yup.string()
        .required()
        .label('Password')
        .matches(
            /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
            'Must contain 8 characters, 1 uppercase, 1 number and 1 special character'
        ),
    newPassword: Yup.string()
        .required()
        .label('New Password')
        .matches(
            /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
            'Must contain 8 characters, 1 uppercase, 1 number and 1 special character'
        ),
    confirmPassword: Yup.string()
        .required()
        .label('Confirm Password')
        .matches(
            /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
            'Must contain 8 characters, 1 uppercase, 1 number and 1 special character'
        ),
});

export default SecurityScreen;
