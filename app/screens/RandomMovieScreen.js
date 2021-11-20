import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Modal,
    TouchableOpacity,
    Dimensions,
    AsyncStorage,
    Text,
} from 'react-native';
import { SERVER_URL} from '@env'
import { changeResolution } from '../config/helperFunctions';

import Screen from '../components/Screen';
import colors from '../config/colors';
import MovieModal from '../components/MovieModal';
import Loading from '../components/Loading';

const fetchUserData = async (setToken) => {
    AsyncStorage.getItem('token')
        .then(async (token) => {
            let response = await fetch(
                `${SERVER_URL}/users`,
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
                setToken(token);
            }
        })
        .catch((err) => {
            console.log(err);
        });
};

const getRandomMovie = async (setMovie, setLoading) => {
    setLoading(true);

    let response = await fetch(
        `${SERVER_URL}/movies/getMovies`,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }
    );

    const body = await response.json();
    const randInt = Math.floor(Math.random() * 106);
    let movie = body[randInt];

    movie = changeResolution('', movie);

    if (response.status !== 200) {
        alert(body);
    } else {
        setMovie(movie);
        setLoading(false);
    }
};

function RandomMovieScreen(props) {
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [token, setToken] = useState('');
    const [movie, setMovie] = useState([]);

    useEffect(() => {
        fetchUserData(setToken);
        getRandomMovie(setMovie, setLoading);
    }, []);

    if (!loading) {
        return (
            <Screen style={styles.container}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <MovieModal
                        movie={movie}
                        setModalVisible={setModalVisible}
                        modalVisible={modalVisible}
                        token={token}
                    />
                </Modal>

                <View style={styles.movieContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            setModalVisible(true);
                        }}
                    >
                        <Image
                            source={{ uri: movie.img }}
                            style={styles.image}
                        />
                    </TouchableOpacity>
                </View>
                <View>
                    <TouchableOpacity
                        style={styles.refreshBtn}
                        onPress={() => getRandomMovie(setMovie, setLoading)}
                    >
                        <View style={styles.inner}>
                            <Text style={styles.text}>CAGE ME</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Screen>
        );
    } else return <Loading />;
}

const screen = Dimensions.get('window').width + Dimensions.get('window').height;

const styles = StyleSheet.create({
    container: {
        fontFamily: 'Montserrat-ExtraBold',
        backgroundColor: colors.bg,
        alignItems: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'space-evenly',
    },
    button: {
        width: screen < 1100 ? 285 : 320,
        height: screen < 1100 ? 435 : 485,
        shadowColor: '#00000080',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowRadius: 5,
        shadowOpacity: 1.0,
        backgroundColor: '#000000',
        elevation: 3,
        borderRadius: 8,
    },
    image: {
        height: '100%',
        width: '100%',
        resizeMode: 'cover',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    refreshBtn: {
        height: 60,
        width: 150,
        backgroundColor: '#976000',
        borderRadius: 12,
        padding: 0,
        marginVertical: 10,
    },
    inner: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 55,
        width: 150,
        borderRadius: 12,
        backgroundColor: colors.orange,
    },
    text: {
        fontSize: 22,
        fontFamily: 'Montserrat-Black',
        color: 'white',
    },
});

export default RandomMovieScreen;
