import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Text,
    Modal,
    TouchableOpacity,
    AsyncStorage,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import colors from '../config/colors';
import { changeResolution } from '../config/helperFunctions';
import { SERVER_URL} from '@env'

import Screen from '../components/Screen';
import MovieModal from '../components/MovieModal';
import Loading from '../components/Loading';

const fetchData = async (setMovies, setLoading, setToken, setQuoteObj) => {
    AsyncStorage.getItem('token')
        .then(async (token) => {
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

            let body = await response.json();

            if (response.status !== 200) {
                alert(body);
            } else {
                setMovies(body);
                setToken(token);
            }

            response = await fetch(
                `${SERVER_URL}/movies/quote`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );

            body = await response.json();

            if (response.status !== 200) {
                alert(body);
            } else {
                setQuoteObj(body);
                setLoading(false);
            }
        })
        .catch((err) => {
            console.log(err);
        });
};

const genres = [
    'Popular',
    'Thriller',
    'Drama',
    'Action',
    'Comedy',
    'Family',
    'Romance',
    'Horror',
    'Crime',
    'War',
    'Mystery',
    'Documentary',
    'Sci-Fi',
    'Fantasy',
];

function HomeScreen(props) {
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(false);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [token, setToken] = useState('');
    const [quoteObj, setQuoteObj] = useState({});

    useEffect(() => {
        fetchData(setMovies, setLoading, setToken, setQuoteObj);
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
                    <Text style={styles.quote}>{quoteObj.quote}</Text>
                    <Text style={styles.subquote}>{quoteObj.subquote}</Text>
                    <Text style={styles.subsubquote}>Verse of the Week</Text>
                    {genres.map((genre, index) => {
                        return (
                            <View key={index + 6969}>
                                <Text style={styles.header}>{genre}</Text>
                                <ScrollView
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    scrollEventThrottle={200}
                                    decelerationRate="fast"
                                    contentContainerStyle={{ marginLeft: 15 }}
                                >
                                    {movies.map((movie, index) => {
                                        movie = changeResolution('l', movie);
                                        if (movie.genres.includes(genre)) {
                                            return (
                                                <TouchableOpacity
                                                    style={styles.button}
                                                    key={index}
                                                    onPress={() => {
                                                        setSelectedMovie(movie);
                                                        setModalVisible(true);
                                                    }}
                                                >
                                                    <Image
                                                        source={{
                                                            uri: movie.img,
                                                        }}
                                                        style={styles.image}
                                                    />
                                                </TouchableOpacity>
                                            );
                                        }
                                    })}
                                    <View style={{ width: 20 }} />
                                </ScrollView>
                            </View>
                        );
                    })}
                    <View
                        style={{
                            alignSelf: 'center',
                            marginVertical: 40,
                        }}
                    >
                        <Text style={styles.tagline}>
                            Buy me some tendies :)
                        </Text>
                        <Text style={styles.subTagline}>
                            paypal: everettgsm@gmail.com
                        </Text>
                        <Text style={styles.subTagline}>venmo: @evdawgg</Text>
                    </View>
                </ScrollView>
            </Screen>
        );
    } else {
        return <Loading />;
    }
}

const styles = StyleSheet.create({
    container: {
        fontFamily: 'Montserrat-ExtraBold',
        backgroundColor: colors.bg,
        paddingTop: 0,
        paddingBottom: 0,
    },
    quote: {
        fontFamily: 'Montserrat-ExtraLight',
        fontSize: 24,
        color: 'white',
        textAlign: 'center',
        marginTop: 30,
        marginHorizontal: 10
    },
    subquote: {
        marginTop: 8,
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        marginHorizontal: 10
    },
    subsubquote: {
        marginTop: 5,
        marginBottom: 10,
        fontFamily: 'Montserrat-ExtraLight',
        fontSize: 10,
        color: 'white',
        textAlign: 'center',
    },
    header: {
        fontFamily: 'Montserrat-ExtraBold',
        fontSize: 25,
        color: 'white',
        marginTop: 20,
        marginBottom: 10,
        marginLeft: 15,
    },
    button: {
        marginRight: 10,
        width: 135,
        height: 200,
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
    tagline: {
        marginTop: 10,
        fontFamily: 'Montserrat-Medium',
        fontSize: 16,
        color: colors.white,
        alignSelf: 'center',
    },
    subTagline: {
        fontFamily: 'Montserrat-Light',
        fontSize: 13,
        color: colors.white,
        alignSelf: 'flex-start',
    },
});

export default HomeScreen;
exports.changeResolution = changeResolution;
