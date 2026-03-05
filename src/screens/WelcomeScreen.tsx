import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStackParamList';
import WelcomeText from '../assets/icons/Group.svg';
import Logon from '../assets/logo/logo.svg';
import CommonButton from '../components/CommonButton';

const WelcomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <View style={styles.welcomeTextContainer}>
        <Logon />
        <WelcomeText />
        <Text style={styles.welcomeText}>
          At WaveMe, we believe in the power of gestures to transform the way you control lighting.
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <CommonButton
          title="Sign Up"
          variant="gradient"
          onPress={() => navigation.navigate('Signup')}
        />
        <CommonButton
          title="Sign in"
          variant="outline"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    welcomeTextContainer: {
        marginTop: 50,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    buttonContainer: {
        marginTop: 50,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 18,
        color: '#ffffff',
        textAlign: 'center',
        marginTop: 20,
    },
})