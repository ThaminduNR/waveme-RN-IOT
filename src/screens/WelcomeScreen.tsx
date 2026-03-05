import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../navigation/RootStackParamList'
import WelcomeText from '../assets/icons/Group.svg';
import Logon from '../assets/logo/logo.svg';

const WelcomeScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>()
    return (
        <View style={styles.container}>
            <View style={styles.welcomeTextContainer}>
                <Logon />
                <WelcomeText />
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Signup" onPress={() => navigation.navigate('Signup') as unknown as () => void} />
            </View>
        </View>
    )
}

export default WelcomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    welcomeTextContainer: {
        marginTop: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        marginTop: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
})