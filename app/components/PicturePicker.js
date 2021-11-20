import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Screen from './Screen.js';
import colors from '../config/colors';
import AppButton from './AppButton.js';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EventRegister } from 'react-native-event-listeners';
import { SERVER_URL} from '@env'

function PicturePicker({ modalVisible, setModalVisible, user, token }) {
    const [selected, setSelected] = useState(0);

    const imgs = [
        'https://i.imgur.com/9NYgErPm.png',
        'https://i.imgur.com/Upkz8OFm.png',
        'https://i.imgur.com/29gBEEPm.png',
        'https://i.imgur.com/iigQEaqm.png',
        'https://i.imgur.com/J2pJMGlm.png',
        'https://i.imgur.com/EpKnEsOm.png',
    ];

    const getPicture = () => {
        imgs.forEach((link, index) => {
            if (link === user.img) {
                setSelected(index);
            }
        });
    };

    useEffect(() => {
        getPicture();
    }, []);

    const handleSubmit = async () => {
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
                    img: imgs[selected],
                }),
            }
        );

        const body = await response.text();

        if (response.status !== 200) {
            alert(body);
        } else {
            getPicture();
            setModalVisible(false);
            EventRegister.emit('refreshPic');
        }
    };

    return (
        <Screen style={styles.screen}>
            <View style={styles.container}>
                <View style={styles.imagesContainer}>
                    {imgs.map((image, index) => (
                        <View style={styles.imgContainer} key={index}>
                            <View
                                style={
                                    selected === index
                                        ? styles.selected
                                        : styles.notSelected
                                }
                            >
                                <MaterialCommunityIcons
                                    name="check"
                                    size={40}
                                    color="white"
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.imgBtn}
                                onPress={() => setSelected(index)}
                            >
                                <Image
                                    source={{
                                        uri: image,
                                    }}
                                    style={styles.img}
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
                <AppButton
                    title="Save"
                    onPress={() => handleSubmit()}
                    style={{ width: '50%', alignSelf: 'center' }}
                />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: '#00000080',
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: colors.bg,
        width: '90%',
        padding: 15,
        borderColor: colors.orange,
        borderWidth: 1,
        borderRadius: 10,
    },
    imagesContainer: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 5,
    },
    imgContainer: {
        width: '50%',
        alignItems: 'center',
    },
    selected: {
        backgroundColor: '#00000080',
        height: 120,
        width: 120,
        zIndex: 1,
        borderRadius: 60,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 10,
    },
    notSelected: {
        display: 'none',
    },
    imgBtn: {
        width: 120,
        height: 120,
        marginVertical: 10,
    },
    img: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
});

export default PicturePicker;
