import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Text,
    Modal,
    AsyncStorage,
} from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { SERVER_URL} from '@env'

import { changeResolution } from '../config/helperFunctions';
import Screen from '../components/Screen';
import colors from '../config/colors';
import MovieModal from '../components/MovieModal';
import Loading from '../components/Loading';

const fetchData = async (setMovies, setLoading, setToken) => {
    AsyncStorage.getItem('token')
        .then(async (token) => {
            let response = await fetch(
                `${SERVER_URL}/users/rate`,
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
                setMovies(body);
                setLoading(false);
                setToken(token);
            }
        })
        .catch((err) => {
            console.log(err);
        });
};

function RatingsScreen(props) {
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [token, setToken] = useState('');
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState({});

    useEffect(() => {
        setMounted(true);

        return () => {
            setMounted(false);
        };
    }, []);

    useEffect(() => {
        if (mounted) fetchData(setMovies, setLoading, setToken);
    });

    if (!loading) {
        if (movies.length == 0)
            return (
                <Screen style={styles.noMoviesContainer}>
                    <Text style={styles.text}>
                        Rate movies to view them here!
                    </Text>
                </Screen>
            );
        else
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
                            movie={selectedMovie}
                            setModalVisible={setModalVisible}
                            modalVisible={modalVisible}
                            token={token}
                        />
                    </Modal>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        decelerationRate="fast"
                    >
                        <View style={styles.scrollContainer}>
                            {movies.map((movie, index) => {
                                movie = changeResolution('l', movie);
                                return (
                                    <View
                                        style={styles.movieContainer}
                                        key={index + 6969}
                                    >
                                        <TouchableOpacity
                                            style={styles.button}
                                            key={index}
                                            onPress={() => {
                                                setSelectedMovie(movie);
                                                setModalVisible(true);
                                            }}
                                        >
                                            <Image
                                                key={movie.id}
                                                source={{ uri: movie.img }}
                                                style={styles.image}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                </Screen>
            );
    } else return <Loading />;
}

const styles = StyleSheet.create({
    container: {
        fontFamily: 'Montserrat-ExtraBold',
        backgroundColor: colors.bg,
        paddingTop: 0,
        paddingBottom: 0,
    },
    scrollContainer: {
        flexDirection: 'row',
        flex: 1,
        flexWrap: 'wrap',
        marginTop: 25,
        width: '100%',
        justifyContent: 'space-evenly',
    },
    movieContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    button: {
        width: 150,
        height: 230,
        shadowColor: '#00000070',
        shadowOffset: {
            width: 3,
            height: 3,
        },
        shadowRadius: 5,
        shadowOpacity: 1.0,
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
    text: {
        color: 'white',
        fontFamily: 'Montserrat-Bold',
        fontSize: 30,
        textAlign: 'center',
        width: '90%',
    },
    noMoviesContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
    },
});

export default RatingsScreen;
