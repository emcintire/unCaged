import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Image,
    TouchableOpacity,
    Modal,
    AsyncStorage,
} from 'react-native';
import * as Yup from 'yup';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SERVER_URL} from '@env'

import Screen from '../components/Screen';
import colors from '../config/colors';
import Loading from '../components/Loading';
import { AppForm, AppFormField, SubmitButton } from '../components/forms';
import PicturePicker from '../components/PicturePicker';

const handleSubmit = async (props, values, user, token) => {
    const name = values.name.length > 0 ? values.name : user.name;
    const email = values.email.length > 0 ? values.email : user.email;

    AsyncStorage.getItem('token')
        .then(async (token) => {
            let response = await fetch(
                `${SERVER_URL}/users/`,
                {
                    method: 'PUT',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'x-auth-token': token,
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email.toLowerCase(),
                    }),
                }
            );

            const body = await response.text();

            if (response.status !== 200) {
                alert(body);
            } else {
                alert('Account Updated!');
                props.navigation.navigate('Settings');
            }
        })
        .catch((err) => {
            console.log(err);
        });
};

const getData = async (setUser, setLoading, setToken) => {
    AsyncStorage.getItem('token')
        .then(async (token) => {
            let response = await fetch(
                `${SERVER_URL}/users/`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'x-auth-token': token,
                    },
                }
            );

            const body = await response.json();

            if (response.status !== 200) {
                alert(body);
            } else {
                setUser(body);
                setLoading(false);
                setToken(token);
            }
        })
        .catch((err) => {
            console.log(err);
        });
};

function AccountDetailsScreen(props) {
    const [user, setUser] = useState({});
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        getData(setUser, setLoading, setToken);
    }, []);

    if (!loading) {
        return (
            <Screen style={styles.screen}>
                <Modal
                    style={{ width: '100%', height: '100%' }}
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <PicturePicker
                        modalVisible={modalVisible}
                        setModalVisible={setModalVisible}
                        user={user}
                        token={token}
                    />
                </Modal>
                <View style={styles.imageContainer}>
                    <TouchableOpacity
                        onPress={() => setModalVisible(!modalVisible)}
                    >
                        <View style={styles.overlay}>
                            <MaterialCommunityIcons
                                name="pencil"
                                size={40}
                                color="white"
                            />
                        </View>
                        <Image
                            source={{ uri: user.img }}
                            style={styles.image}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.formContainer}>
                    <AppForm
                        initialValues={{ name: user.name, email: user.email }}
                        onSubmit={(values) =>
                            handleSubmit(props, values, user, token)
                        }
                        validationSchema={validationSchema}
                    >
                        <AppFormField
                            autoCapitalize="none"
                            autoCorrect={false}
                            icon="account"
                            name="name"
                            textContentType="name"
                            placeholder={user.name}
                        />
                        <AppFormField
                            autoCapitalize="none"
                            autoCorrect={false}
                            icon="email"
                            keyboardType="email-address"
                            name="email"
                            textContentType="emailAddress"
                            placeholder={user.email}
                        />
                        <SubmitButton title="Save" style={styles.saveButton} />
                    </AppForm>
                </View>
            </Screen>
        );
    } else return <Loading />;
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: colors.bg,
        height: '100%',
        width: '100%',
        padding: 15,
    },
    imageContainer: {
        height: '20%',
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    image: {
        height: 150,
        width: 150,
        borderRadius: 75,
    },
    saveButton: {
        marginTop: 30,
    },
    formContainer: {
        marginTop: 50,
    },
    overlay: {
        position: 'absolute',
        height: 150,
        width: 150,
        borderRadius: 75,
        backgroundColor: '#00000060',
        zIndex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

const validationSchema = Yup.object().shape({
    name: Yup.string().label('Name'),
    email: Yup.string().email().label('Email'),
});

export default AccountDetailsScreen;
