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
import { getToken } from '../utils/tokenStorage';
import Logo from '../assets/logo/logo.svg';
import SpText from '../assets/icons/spText.svg';

const frameBg = require('../assets/logo/spScreen.png');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const SpalshScreen = ({ navigation }: Props) => {
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const token = await getToken();
      await new Promise<void>((resolve) => setTimeout(resolve, 2500));
      if (cancelled) {
        return;
      }
      navigation.replace(token ? 'Home' : 'Welcome');
    };
    run();
    return () => {
      cancelled = true;
    };
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
