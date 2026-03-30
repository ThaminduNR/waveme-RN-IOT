import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/RootStackParamList';
import CameraIcon from '../assets/icons/Camera.svg';
import ListIcon from '../assets/icons/List.svg';
import SettingsIcon from '../assets/icons/Settings.svg';
import UserIcon from '../assets/icons/User.svg';
import { useUserProfile } from '../hooks/useUserProfile';

const frameBg = require('../assets/logo/Frameimg.png');

function displayFirstName(name: string | undefined): string {
  if (!name?.trim()) {
    return 'there';
  }
  return name.trim().split(/\s+/)[0] ?? 'there';
}

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

type MenuItem = {
  IconComponent: React.FC<{ width?: number; height?: number }>;
  title: string;
  subtitle: string;
  iconBg: string;
  onPress: () => void;
};

const HomeScreen = ({ navigation }: Props) => {
  const { user } = useUserProfile();

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({ headerShown: false });
    }, [navigation]),
  );

  const menuItems: MenuItem[] = [
    {
      IconComponent: CameraIcon,
      title: 'Open Camera',
      subtitle: 'Start gesture detection',
      iconBg: '#BE25E2',
      onPress: () => navigation.navigate('Camera'),
    },
    {
      IconComponent: ListIcon,
      title: 'Gesture List',
      subtitle: 'View available gestures',
      iconBg: '#9B24D0',
      onPress: () => { },
    },
    {
      IconComponent: SettingsIcon,
      title: 'Settings',
      subtitle: 'Customize your experience',
      iconBg: '#3D6FE8',
      onPress: () => { },
    },
  ];

  return (
    <ImageBackground
      source={frameBg}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hi {displayFirstName(user?.name)},
            </Text>
            <Text style={styles.subGreeting}>Welcome back</Text>
          </View>

          <TouchableOpacity
            style={styles.avatarButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Profile')}
          >
            <UserIcon width={22} height={22} />
          </TouchableOpacity>
        </View>

        {/* Menu Cards */}
        <View style={styles.cardsContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              activeOpacity={0.7}
              onPress={item.onPress}
            >
              <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                <item.IconComponent width={26} height={26} />
              </View>

              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#0A0010',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  subGreeting: {
    fontSize: 14,
    color: '#9E8AAE',
    marginTop: 3,
  },
  avatarButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#B030D5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#B030D5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    elevation: 5,
    shadowColor: '#9810FA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#7A6A8A',
  },
});
