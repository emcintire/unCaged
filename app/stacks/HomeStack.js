import React, { useEffect, useState } from 'react';
import {
    TouchableOpacity,
    View,
    Image,
    AsyncStorage,
    Text,
    StyleSheet,
} from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EventRegister } from 'react-native-event-listeners';
import { SERVER_URL} from '@env'

import colors from '../config/colors';
import SmallLogo from '../assets/imgs/small_logo.svg';
import HomeScreen from '../screens/HomeScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import RandomMovieScreen from '../screens/RandomMovieScreen';
import AccountScreen from '../screens/AccountScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SeenScreen from '../screens/SeenScreen';
import AccountDetailsScreen from '../screens/AccountDetailsScreen';
import SecurityScreen from '../screens/SecurityScreen';
import AboutScreen from '../screens/AboutScreen';
import RatingsScreen from '../screens/RatingsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicy';
import SearchScreen from '../screens/SearchScreen';

const Tab = createMaterialBottomTabNavigator();
const Home_Stack = createNativeStackNavigator();
const Watchlist_Stack = createNativeStackNavigator();
const Search_Stack = createNativeStackNavigator();
const Random_Stack = createNativeStackNavigator();
const Settings_Stack = createNativeStackNavigator();

const styles = StyleSheet.create({
    resetText: {
        color: colors.white,
        fontFamily: 'Montserrat-Medium',
        fontSize: 16,
    },
});

const fetchData = async (setUser) => {
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
            }
        })
        .catch((err) => {
            console.log(err);
        });
};

export default function HomeStack(props) {
    const [user, setUser] = useState({});

    useEffect(() => {
        fetchData(setUser);

        EventRegister.addEventListener('refreshPic', () => {
            fetchData(setUser);
        });

        return () => {
            EventRegister.removeAllListeners();
        };
    }, []);

    function HomeStackScreen(props) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.bg }}>
                <Home_Stack.Navigator
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: colors.black,
                        },
                        headerTintColor: '#fff',

                        headerBackTitleVisible: false,
                    }}
                >
                    <Home_Stack.Screen
                        name="Home"
                        options={{
                            headerLeft: (props) => (
                                <SmallLogo width={100} height={20} />
                            ),
                            headerRight: () => (
                                <TouchableOpacity
                                    onPress={() => {
                                        fetchData(setUser);
                                        props.navigation.navigate(
                                            'SettingsTab'
                                        );
                                    }}
                                >
                                    <Image
                                        source={{
                                            uri: user.img,
                                        }}
                                        style={{
                                            width: 35,
                                            height: 35,
                                            borderRadius: 17.5,
                                        }}
                                    />
                                </TouchableOpacity>
                            ),
                            headerTitleAlign: 'center',
                            headerTitleStyle: {
                                fontFamily: 'Montserrat-Bold',
                                fontSize: 22,
                            },
                        }}
                    >
                        {(props) => <HomeScreen {...props} />}
                    </Home_Stack.Screen>
                </Home_Stack.Navigator>
            </View>
        );
    }

    function WatchlistStackScreen(props) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.bg }}>
                <Watchlist_Stack.Navigator
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: colors.black,
                        },
                        headerTintColor: '#fff',
                        headerBackTitleVisible: false,
                    }}
                >
                    <Watchlist_Stack.Screen
                        name="Watchlist"
                        options={{
                            headerLeft: (props) => (
                                <SmallLogo width={100} height={20} />
                            ),
                            headerRight: () => (
                                <TouchableOpacity
                                    onPress={() => {
                                        fetchData(setUser);
                                        props.navigation.navigate(
                                            'SettingsTab'
                                        );
                                    }}
                                >
                                    <Image
                                        source={{
                                            uri: user.img,
                                        }}
                                        style={{
                                            width: 35,
                                            height: 35,
                                            borderRadius: 17.5,
                                        }}
                                    />
                                </TouchableOpacity>
                            ),
                            headerTitleAlign: 'center',
                            headerTitleStyle: {
                                fontFamily: 'Montserrat-Bold',
                                fontSize: 20,
                            },
                        }}
                    >
                        {(props) => <WatchlistScreen {...props} />}
                    </Watchlist_Stack.Screen>
                </Watchlist_Stack.Navigator>
            </View>
        );
    }

    function SearchStackScreen(props) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.bg }}>
                <Search_Stack.Navigator
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: colors.black,
                        },
                        headerTintColor: '#fff',

                        headerBackTitleVisible: false,
                    }}
                >
                    <Search_Stack.Screen
                        name="Search"
                        options={{
                            headerLeft: (props) => (
                                <SmallLogo width={100} height={20} />
                            ),
                            headerRight: () => (
                                <TouchableOpacity
                                    onPress={() => {
                                        fetchData(setUser);
                                        props.navigation.navigate(
                                            'SettingsTab'
                                        );
                                    }}
                                >
                                    <Image
                                        source={{
                                            uri: user.img,
                                        }}
                                        style={{
                                            width: 35,
                                            height: 35,
                                            borderRadius: 17.5,
                                        }}
                                    />
                                </TouchableOpacity>
                            ),
                            headerTitleAlign: 'center',
                            headerTitleStyle: {
                                fontFamily: 'Montserrat-Bold',
                                fontSize: 22,
                            },
                        }}
                    >
                        {(props) => <SearchScreen {...props} />}
                    </Search_Stack.Screen>
                </Search_Stack.Navigator>
            </View>
        );
    }

    function RandonMovieStackScreen(props) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.bg }}>
                <Random_Stack.Navigator
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: colors.black,
                        },
                        headerTintColor: '#fff',
                        headerBackTitleVisible: false,
                    }}
                >
                    <Random_Stack.Screen
                        name="Random"
                        options={{
                            headerLeft: (props) => (
                                <SmallLogo width={100} height={20} />
                            ),
                            headerRight: () => (
                                <TouchableOpacity
                                    onPress={() => {
                                        fetchData(setUser);
                                        props.navigation.navigate(
                                            'SettingsTab'
                                        );
                                    }}
                                >
                                    <Image
                                        source={{
                                            uri: user.img,
                                        }}
                                        style={{
                                            width: 35,
                                            height: 35,
                                            borderRadius: 17.5,
                                        }}
                                    />
                                </TouchableOpacity>
                            ),
                            headerTitleAlign: 'center',
                            headerTitleStyle: {
                                fontFamily: 'Montserrat-Bold',
                                fontSize: 20,
                            },
                        }}
                    >
                        {(props) => <RandomMovieScreen {...props} />}
                    </Random_Stack.Screen>
                </Random_Stack.Navigator>
            </View>
        );
    }

    function AccountStackScreen(props) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.bg }}>
                <Settings_Stack.Navigator
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: colors.black,
                        },
                        headerTintColor: '#fff',
                        headerBackTitleVisible: false,
                    }}
                >
                    <Settings_Stack.Screen
                        name="Settings"
                        options={{
                            headerLeft: (props) => (
                                <SmallLogo width={100} height={20} />
                            ),
                            headerRight: () => (
                                <TouchableOpacity
                                    onPress={() => {
                                        fetchData(setUser);
                                        props.navigation.navigate(
                                            'SettingsTab'
                                        );
                                    }}
                                >
                                    <Image
                                        source={{
                                            uri: user.img,
                                        }}
                                        style={{
                                            width: 35,
                                            height: 35,
                                            borderRadius: 17.5,
                                        }}
                                    />
                                </TouchableOpacity>
                            ),
                            headerTitleAlign: 'center',
                            headerTitleStyle: {
                                fontFamily: 'Montserrat-Bold',
                                fontSize: 20,
                            },
                        }}
                    >
                        {(props) => <AccountScreen {...props} />}
                    </Settings_Stack.Screen>
                    <Settings_Stack.Screen
                        name="My Account"
                        options={{
                            headerTitleAlign: 'center',
                            headerTitleStyle: {
                                fontFamily: 'Montserrat-Bold',
                                fontSize: 20,
                            },
                        }}
                    >
                        {(props) => <AccountDetailsScreen {...props} />}
                    </Settings_Stack.Screen>
                    <Settings_Stack.Screen
                        name="Favorites"
                        options={{
                            headerRight: () => (
                                <Image
                                    source={{
                                        uri: user.img,
                                    }}
                                    style={{
                                        width: 35,
                                        height: 35,
                                        borderRadius: 17.5,
                                    }}
                                />
                            ),
                            headerTitleAlign: 'center',
                            headerTitleStyle: {
                                fontFamily: 'Montserrat-Bold',
                                fontSize: 20,
                            },
                        }}
                    >
                        {(props) => <FavoritesScreen {...props} />}
                    </Settings_Stack.Screen>
                    <Settings_Stack.Screen
                        name="Seen"
                        options={{
                            headerRight: () => (
                                <Image
                                    source={{
                                        uri: user.img,
                                    }}
                                    style={{
                                        width: 35,
                                        height: 35,
                                        borderRadius: 17.5,
                                    }}
                                />
                            ),
                            headerTitleAlign: 'center',
                            headerTitleStyle: {
                                fontFamily: 'Montserrat-Bold',
                                fontSize: 20,
                            },
                        }}
                    >
                        {(props) => <SeenScreen {...props} />}
                    </Settings_Stack.Screen>
                    <Settings_Stack.Screen
                        name="Ratings"
                        options={{
                            headerRight: () => (
                                <Image
                                    source={{
                                        uri: user.img,
                                    }}
                                    style={{
                                        width: 35,
                                        height: 35,
                                        borderRadius: 17.5,
                                    }}
                                />
                            ),
                            headerTitleAlign: 'center',
                            headerTitleStyle: {
                                fontFamily: 'Montserrat-Bold',
                                fontSize: 20,
                            },
                        }}
                    >
                        {(props) => <RatingsScreen {...props} />}
                    </Settings_Stack.Screen>
                    <Settings_Stack.Screen
                        name="Security"
                        options={{
                            headerRight: () => (
                                <Image
                                    source={{
                                        uri: user.img,
                                    }}
                                    style={{
                                        width: 35,
                                        height: 35,
                                        borderRadius: 17.5,
                                    }}
                                />
                            ),
                            headerTitleAlign: 'center',
                            headerTitleStyle: {
                                fontFamily: 'Montserrat-Bold',
                                fontSize: 20,
                            },
                        }}
                    >
                        {(props) => <SecurityScreen {...props} />}
                    </Settings_Stack.Screen>
                    <Settings_Stack.Screen
                        name="About"
                        options={{
                            headerTitleAlign: 'center',
                            headerTitleStyle: {
                                fontFamily: 'Montserrat-Bold',
                                fontSize: 20,
                            },
                        }}
                    >
                        {(props) => <AboutScreen {...props} />}
                    </Settings_Stack.Screen>
                    <Settings_Stack.Screen
                        name="Privacy Policy"
                        options={{
                            headerTitleAlign: 'center',
                            headerTitleStyle: {
                                fontFamily: 'Montserrat-Bold',
                                fontSize: 20,
                            },
                        }}
                    >
                        {(props) => <PrivacyPolicyScreen {...props} />}
                    </Settings_Stack.Screen>
                </Settings_Stack.Navigator>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Tab.Navigator
                activeColor={colors.orange}
                inactiveColor={colors.medium}
                barStyle={{ backgroundColor: colors.black }}
                initialRouteName="HomeTab"
                tabBarIconStyle={{ width: 40, height: 40, padding: 0 }}
                shifting={true}
            >
                <Tab.Screen
                    name="HomeTab"
                    component={HomeStackScreen}
                    options={{
                        headerShown: false,
                        tabBarLabel: 'Home',
                        tabBarIcon: ({ color }) => (
                            <MaterialCommunityIcons
                                name="home"
                                color={color}
                                size={27}
                            />
                        ),
                    }}
                />
                <Tab.Screen
                    name="WatchlistTab"
                    component={WatchlistStackScreen}
                    options={{
                        headerShown: false,
                        tabBarLabel: 'Watchlist',
                        tabBarIcon: ({ color }) => (
                            <MaterialCommunityIcons
                                name="bookmark"
                                color={color}
                                size={27}
                            />
                        ),
                    }}
                />
                <Tab.Screen
                    name="SearchTab"
                    component={SearchStackScreen}
                    options={{
                        headerShown: false,
                        tabBarLabel: 'Search',
                        tabBarIcon: ({ color }) => (
                            <MaterialCommunityIcons
                                name="magnify"
                                color={color}
                                size={27}
                            />
                        ),
                    }}
                />
                <Tab.Screen
                    name="RandomTab"
                    component={RandonMovieStackScreen}
                    options={{
                        headerShown: false,
                        tabBarLabel: 'Random',
                        tabBarIcon: ({ color }) => (
                            <MaterialCommunityIcons
                                name="dice-3"
                                color={color}
                                size={27}
                            />
                        ),
                    }}
                />
                <Tab.Screen
                    name="SettingsTab"
                    component={AccountStackScreen}
                    options={{
                        headerShown: false,
                        tabBarLabel: 'Settings',
                        tabBarIcon: ({ color }) => (
                            <MaterialCommunityIcons
                                name="cog"
                                color={color}
                                size={27}
                            />
                        ),
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
