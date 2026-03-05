import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/RootStackParamList';
import Logo from '../assets/logo/logo.svg';
import SpText from '../assets/icons/spText.svg';

const frameBg = require('../assets/logo/spScreen.png');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const SpalshScreen = ({ navigation }: Props) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.logoContainer}>
          <Logo />
        </View>
        <View style={styles.spTextContainer}>
          <SpText />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SpalshScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  spTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
});
