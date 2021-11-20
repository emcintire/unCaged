import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { changeResolution } from '../config/helperFunctions';
import { SERVER_URL} from '@env'

import Icon from './Icon';
import colors from '../config/colors';

const addToSeen = async (id, token, setSeen) => {
    let response = await fetch(
        `${SERVER_URL}/users/seen`,
        {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
            body: JSON.stringify({
                id: id,
            }),
        }
    );

    const body = await response.text();

    if (response.status !== 200) {
        alert(body);
    } else {
        setSeen(true);
    }
};

const addToFavorites = async (id, token, setFavorite) => {
    let response = await fetch(
        `${SERVER_URL}/users/favorites`,
        {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
            body: JSON.stringify({
                id: id,
            }),
        }
    );

    const body = await response.text();

    if (response.status !== 200) {
        alert(body);
    } else {
        setFavorite(true);
    }
};

const addToWatchlist = async (id, token, setWatchlist) => {
    let response = await fetch(
        `${SERVER_URL}/users/watchlist`,
        {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
            body: JSON.stringify({
                id: id,
            }),
        }
    );

    const body = await response.text();

    if (response.status !== 200) {
        alert(body);
    } else {
        setWatchlist(true);
    }
};

const removeFromSeen = async (id, token, setSeen) => {
    let response = await fetch(
        `${SERVER_URL}/users/seen`,
        {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
            body: JSON.stringify({
                id: id,
            }),
        }
    );

    const body = await response.text();

    if (response.status !== 200) {
        alert(body);
    } else {
        setSeen(false);
    }
};

const removeFromFavorites = async (id, token, setFavorites) => {
    let response = await fetch(
        `${SERVER_URL}/users/favorites`,
        {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
            body: JSON.stringify({
                id: id,
            }),
        }
    );

    const body = await response.text();

    if (response.status !== 200) {
        alert(body);
    } else {
        setFavorites(false);
    }
};

const removeFromWatchlist = async (id, token, setWatchlist) => {
    let response = await fetch(
        `${SERVER_URL}/users/watchlist`,
        {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
            body: JSON.stringify({
                id: id,
            }),
        }
    );

    const body = await response.text();

    if (response.status !== 200) {
        alert(body);
    } else {
        setWatchlist(false);
    }
};

const rateMovie = async (id, token, rating, setShowStars, setRating) => {
    let response = await fetch(
        `${SERVER_URL}/users/rate`,
        {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
            body: JSON.stringify({
                id: id,
                rating: rating,
            }),
        }
    );

    const body = await response.text();

    if (response.status !== 200) {
        alert(body);
    } else {
        // setShowStars(false);
        setRating(rating);
    }
};

const removeRating = async (id, token, setRating) => {
    let response = await fetch(
        `${SERVER_URL}/users/rate`,
        {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
            body: JSON.stringify({
                id: id,
            }),
        }
    );

    const body = await response.text();

    if (response.status !== 200) {
        alert(body);
    } else {
        setRating(0);
    }
};

const getRating = async (id, setMovieRating) => {
    let response = await fetch(
        `${SERVER_URL}/movies/avgRating/${id}`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }
    );

    const body = await response.text();

    if (response.status !== 200) {
        alert(body);
    } else {
        setMovieRating(body);
    }
};

const fetchData = async (
    token,
    movie,
    setSeen,
    setFavorite,
    setWatchlist,
    setRating
) => {
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
        body.seen.forEach((m) => {
            if (m === movie._id) {
                setSeen(true);
            }
        });
        body.favorites.forEach((m) => {
            if (m === movie._id) {
                setFavorite(true);
            }
        });
        body.watchlist.forEach((m) => {
            if (m === movie._id) {
                setWatchlist(true);
            }
        });
        body.ratings.forEach((m) => {
            if (m.movie === movie._id) {
                setRating(m.rating);
            }
        });
    }
};

const updateRatings = () => {
    fetch(`${SERVER_URL}/movies/updateRatings`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
};

export default function MovieModal({
    movie,
    setModalVisible,
    modalVisible,
    token,
}) {
    const [loading, setLoading] = useState(true);
    const [favorite, setFavorite] = useState(false);
    const [seen, setSeen] = useState(false);
    const [watchlist, setWatchlist] = useState(false);
    const [rating, setRating] = useState(0);
    const [movieRating, setMovieRating] = useState(0);
    const [showStars, setShowStars] = useState(false);
    const [movieObj, setMovieObj] = useState({});

    useEffect(() => {
        fetchData(token, movie, setSeen, setFavorite, setWatchlist, setRating);
        getRating(movie._id, setMovieRating);

        let tempMovie = JSON.parse(JSON.stringify(movie)); //Changes the quality of the img
        let movieOb = tempMovie;

        movieOb.img.length === 32
            ? (movieOb = changeResolution('h', tempMovie))
            : null;

        const index = movieOb.genres.indexOf('Popular'); //Removes the genre "Popular" if exists
        if (index > -1) {
            movieOb.genres.splice(index, 1);
        }

        setMovieObj(movieOb);
        setLoading(false);
    }, []);

    const handleRating = async (num) => {
        if (rating) {
            if (rating === num) {
                await removeRating(movieObj._id, token, setRating);
            } else {
                await removeRating(movieObj._id, token, setRating);
                await rateMovie(
                    movieObj._id,
                    token,
                    num,
                    setShowStars,
                    setRating
                );
            }
        } else
            await rateMovie(movieObj._id, token, num, setShowStars, setRating);
        await getRating(movieObj._id, setMovieRating);
        updateRatings();
    };

    const styles = StyleSheet.create({
        background: {
            backgroundColor: '#00000090',
            height: '100%',
            width: '100%',
        },
        container: {
            width: '90%',
            alignSelf: 'center',
            backgroundColor: colors.bg,
            borderColor: colors.orange,
            borderWidth: 1,
            borderRadius: 10,
            marginTop: 60,
            marginBottom: 60,
            padding: 15,
        },
        btnContainer: {
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 10,
        },
        image: {
            marginTop: 20,
            height: 320,
            width: 215,
            resizeMode: 'cover',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'transparent',
            overflow: 'hidden',
            alignSelf: 'center',
        },
        titleContainer: {
            width: '90%',
            alignItems: 'center',
            alignSelf: 'center',
            marginTop: 10,
        },
        title: {
            color: colors.white,
            fontFamily: 'Montserrat-Bold',
            fontSize: 26,
            textAlign: 'center',
        },
        subtitle: {
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            marginTop: 10,
            width: '100%',
        },
        date: {
            color: colors.white,
            fontFamily: 'Montserrat-Medium',
            fontSize: 18,
            textAlign: 'left',
        },
        director: {
            color: colors.white,
            fontFamily: 'Montserrat-Medium',
            fontSize: 18,
        },
        seenLabel: {
            position: 'absolute',
            top: 45,
            color: seen ? colors.orange : colors.medium,
            fontFamily: 'Montserrat-Medium',
            fontSize: 9,
        },
        rateLabel: {
            position: 'absolute',
            top: 45,
            color: rating > 0 ? colors.orange : colors.medium,
            fontFamily: 'Montserrat-Medium',
            fontSize: 9,
        },
        favLabel: {
            position: 'absolute',
            top: 45,
            color: favorite ? colors.orange : colors.medium,
            fontFamily: 'Montserrat-Medium',
            fontSize: 9,
        },
        watchLabel: {
            position: 'absolute',
            top: 45,
            color: watchlist ? colors.orange : colors.medium,
            fontFamily: 'Montserrat-Medium',
            fontSize: 9,
        },
        detailsContainer: {
            marginTop: 20,
            marginBottom: 60,
            alignItems: 'center',
        },
        label: {
            color: colors.white,
            fontFamily: 'Montserrat-Medium',
            fontSize: 15,
            marginBottom: 10,
            width: '50%',
        },
        details: {
            color: colors.white,
            fontFamily: 'Montserrat-Light',
            fontSize: 15,
            width: '50%',
        },
        description: {
            color: colors.white,
            fontFamily: 'Montserrat-Light',
            fontSize: 15,
            width: '95%',
        },
        textContainer: {
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            width: '95%',
        },
        stars: {
            marginTop: 5,
            backgroundColor: colors.black,
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'center',
            alignSelf: 'center',
            alignItems: 'center',
            borderRadius: 10,
        },
    });

    if (!loading)
        return (
            <View style={styles.background}>
                <ScrollView
                    horizontal={false}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={200}
                    decelerationRate="fast"
                    style={styles.container}
                >
                    <View style={styles.btnContainer}>
                        <TouchableOpacity
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Icon
                                name="close"
                                size={30}
                                backgroundColor={colors.black}
                                iconColor={colors.red}
                            />
                        </TouchableOpacity>
                    </View>
                    <Image
                        source={{ uri: movieObj.img }}
                        style={styles.image}
                    />
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{movieObj.title}</Text>
                        <View style={styles.subtitle}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={styles.date}>{movieRating}</Text>
                                <Text style={styles.date}> / 5</Text>
                            </View>
                            <Text style={styles.date}>
                                {movieObj.date.substring(0, 4)}
                            </Text>
                        </View>
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-evenly',
                        }}
                    >
                        <View style={{ alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() =>
                                    seen
                                        ? removeFromSeen(
                                              movieObj._id,
                                              token,
                                              setSeen
                                          )
                                        : addToSeen(
                                              movieObj._id,
                                              token,
                                              setSeen
                                          )
                                }
                            >
                                <Icon
                                    name="eye"
                                    size={60}
                                    backgroundColor={colors.bg}
                                    iconColor={
                                        seen ? colors.orange : colors.medium
                                    }
                                />
                            </TouchableOpacity>
                            <Text style={styles.seenLabel}>Seen</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => setShowStars(!showStars)}
                            >
                                <Icon
                                    name="star"
                                    size={60}
                                    backgroundColor={colors.bg}
                                    iconColor={
                                        rating > 0
                                            ? colors.orange
                                            : colors.medium
                                    }
                                />
                            </TouchableOpacity>
                            <Text style={styles.rateLabel}>Rate</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() =>
                                    favorite
                                        ? removeFromFavorites(
                                              movieObj._id,
                                              token,
                                              setFavorite
                                          )
                                        : addToFavorites(
                                              movieObj._id,
                                              token,
                                              setFavorite
                                          )
                                }
                            >
                                <Icon
                                    name="heart"
                                    size={60}
                                    backgroundColor={colors.bg}
                                    iconColor={
                                        favorite ? colors.orange : colors.medium
                                    }
                                />
                            </TouchableOpacity>
                            <Text style={styles.favLabel}>Favorite</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() =>
                                    watchlist
                                        ? removeFromWatchlist(
                                              movieObj._id,
                                              token,
                                              setWatchlist
                                          )
                                        : addToWatchlist(
                                              movieObj._id,
                                              token,
                                              setWatchlist
                                          )
                                }
                            >
                                <Icon
                                    name="bookmark"
                                    size={60}
                                    backgroundColor={colors.bg}
                                    iconColor={
                                        watchlist
                                            ? colors.orange
                                            : colors.medium
                                    }
                                />
                            </TouchableOpacity>
                            <Text style={styles.watchLabel}>Watchlist</Text>
                        </View>
                    </View>
                    {showStars ? (
                        <View style={styles.stars}>
                            <TouchableOpacity onPress={() => handleRating(1)}>
                                <Icon
                                    name="star"
                                    size={60}
                                    backgroundColor={colors.black}
                                    iconColor={
                                        rating > 0
                                            ? colors.orange
                                            : colors.medium
                                    }
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleRating(2)}>
                                <Icon
                                    name="star"
                                    size={60}
                                    backgroundColor={colors.black}
                                    iconColor={
                                        rating > 1
                                            ? colors.orange
                                            : colors.medium
                                    }
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleRating(3)}>
                                <Icon
                                    name="star"
                                    size={60}
                                    backgroundColor={colors.black}
                                    iconColor={
                                        rating > 2
                                            ? colors.orange
                                            : colors.medium
                                    }
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleRating(4)}>
                                <Icon
                                    name="star"
                                    size={60}
                                    backgroundColor={colors.black}
                                    iconColor={
                                        rating > 3
                                            ? colors.orange
                                            : colors.medium
                                    }
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleRating(5)}>
                                <Icon
                                    name="star"
                                    size={60}
                                    backgroundColor={colors.black}
                                    iconColor={
                                        rating > 4
                                            ? colors.orange
                                            : colors.medium
                                    }
                                />
                            </TouchableOpacity>
                        </View>
                    ) : null}
                    <View style={styles.detailsContainer}>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>Genres:</Text>
                            <Text style={styles.details}>
                                {movieObj.genres.join(', ')}
                            </Text>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>Age rating:</Text>
                            <Text style={styles.details}>
                                {movieObj.rating}
                            </Text>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>Runtime:</Text>
                            <Text style={styles.details}>
                                {movieObj.runtime}
                            </Text>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>Director:</Text>
                            <Text style={styles.details}>
                                {movieObj.director}
                            </Text>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.label}>Description:</Text>
                            <Text style={styles.details}></Text>
                        </View>
                        <Text style={styles.description}>
                            {movieObj.description}
                        </Text>
                    </View>
                </ScrollView>
            </View>
        );
    else return <View style={styles.background}></View>;
}
