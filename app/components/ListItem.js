import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AppText from '../components/AppText';
import colors from '../config/colors';

function ListItem({ title, subTitle, image, IconComponent, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} underlayColor={colors.light}>
            <View style={styles.container}>
                {IconComponent}
                {image && <Image style={styles.image} source={image} />}
                <View style={styles.detailsContainer}>
                    <AppText style={styles.title} numberOfLines={1}>
                        {title}
                    </AppText>
                    {subTitle && (
                        <AppText style={styles.subTitle} numberOfLines={2}>
                            {subTitle}
                        </AppText>
                    )}
                </View>
                <MaterialCommunityIcons
                    color={colors.medium}
                    name="chevron-right"
                    size={25}
                />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 15,
        marginHorizontal: 10,
        backgroundColor: colors.black,
        alignItems: 'center',
        borderRadius: 20,
    },
    detailsContainer: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    subTitle: {
        color: colors.light,
        fontSize: 14,
        fontFamily: 'Montserrat-Light',
    },
    title: {
        fontSize: 18,
        color: colors.white,
        fontFamily: 'Montserrat-Medium',
    },
});

export default ListItem;
