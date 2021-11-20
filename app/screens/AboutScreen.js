import React from 'react';
import { StyleSheet, Text, ScrollView, View } from 'react-native';

import Screen from '../components/Screen';
import colors from '../config/colors';

function AboutScreen(props) {
    return (
        <Screen style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                decelerationRate="fast"
            >
                <Text style={styles.header}>Disclaimer</Text>
                <Text style={styles.body}>
                    This app may contain copyrighted material, the use of which
                    may not have been specifically authorized by the copyright
                    owner. This material is available and distributed without
                    profit for research and educational purposes. Only small
                    portions of the original work are being used and those could
                    not be used easily to duplicate the original work.
                    {'\n\n'}
                    This should constitute a ‘fair use’ of any such copyrighted
                    material (referenced and provided for in section 107 of the
                    US Copyright Law).{'\n\n'}
                    If you wish to use any copyrighted material from this site
                    for purposes of your own that go beyond ‘fair use’, you must
                    obtain expressed permission from the copyright owner.
                    {'\n\n'}
                    <Text style={styles.bodyHeader}>
                        U.S. COPYRIGHT OFFICE- FAIR USE DEFINITION{'\n'}
                        {'\n'}
                    </Text>
                    One of the rights accorded to the owner of copyright is the
                    right to reproduce or to authorize others to reproduce the
                    work in copies or phonorecords. This right is subject to
                    certain limitations found in sections 107 through 118 of the
                    copyright law (title 17, U.S. Code). One of the more
                    important limitations is the doctrine of “fair use”. The
                    doctrine of fair use has developed through a substantial
                    number of court decisions over the years and has been
                    codified in section 107 of the copyright law.{'\n\n'}
                    Section 107 contains a list of the various purposes for
                    which the reproduction of a particular work may be
                    considered fair, such as criticism, comment, news reporting,
                    teaching, scholarship, and research. Section 107 also sets
                    out in four factors to be considered in determining whether
                    or not a particular use is fair:{'\n\n'} 1. The purpose and
                    character of the use, including whether such use is of
                    commercial nature or is for nonprofit educational purposes
                    {'\n\n'} 2. The nature of the copyrighted work{'\n\n'} 3.
                    The amount and substantiality of the portion used in
                    relation to the copyrighted work as a whole{'\n\n'}
                    4. The effect of the use upon the potential market for, or
                    value of, the copyrighted work
                </Text>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.bg,
        height: '100%',
        width: '100%',
        padding: 15,
        paddingTop: 0,
        paddingBottom: 0,
    },
    header: {
        marginTop: 10,
        fontFamily: 'Montserrat-Bold',
        fontSize: 25,
        color: colors.white,
        marginBottom: 10,
    },
    body: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 18,
        color: colors.white,
        marginBottom: 40,
    },
    bodyHeader: {
        fontFamily: 'Montserrat-Medium',
        fontSize: 18,
        color: colors.white,
    },
    tagline: {
        marginTop: 10,
        fontFamily: 'Montserrat-Medium',
        fontSize: 18,
        color: colors.white,
        alignSelf: 'center',
    },
    subTagline: {
        fontFamily: 'Montserrat-Light',
        fontSize: 14,
        color: colors.white,
        alignSelf: 'flex-start',
    },
});

export default AboutScreen;
