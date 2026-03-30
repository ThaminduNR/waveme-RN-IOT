import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStackParamList';
import CommonHeader from '../components/CommonHeader';
import CommonButton from '../components/CommonButton';
import UserIcon from '../assets/icons/User.svg';
import { useUserProfile } from '../hooks/useUserProfile';
import { removeToken } from '../utils/tokenStorage';
import MailIcon from '../assets/icons/Mail.svg';
import LockIcon from '../assets/icons/Lock.svg';

const AVATAR_SIZE = 100;
const RING_STROKE = 3;

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return parts[0]?.slice(0, 1).toUpperCase() ?? '?';
}

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const contentWidth = width - 48;
  const { user } = useUserProfile();

  const displayName = user?.name?.trim() || '—';
  const displayEmail = user?.email?.trim() || '—';

  const infoRows = [
    {
      icon: UserIcon,
      iconBg: '#BE25E2',
      label: 'Name',
      value: displayName,
    },
    {
      icon: MailIcon,
      iconBg: '#E91E63',
      label: 'Email',
      value: displayEmail,
    },

  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CommonHeader onBackPress={() => navigation.goBack()} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile avatar with gradient ring */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarInner}>
            <Text style={styles.avatarPlaceholder}>
              {user?.name ? initialsFromName(user.name) : '—'}
            </Text>
          </View>
          <Svg
            style={StyleSheet.absoluteFill}
            width={AVATAR_SIZE + RING_STROKE * 2}
            height={AVATAR_SIZE + RING_STROKE * 2}
          >
            <Defs>
              <LinearGradient id="avatarGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#F6339A" />
                <Stop offset="1" stopColor="#7C4DFF" />
              </LinearGradient>
            </Defs>
            <Circle
              cx={AVATAR_SIZE / 2 + RING_STROKE}
              cy={AVATAR_SIZE / 2 + RING_STROKE}
              r={AVATAR_SIZE / 2}
              fill="none"
              stroke="url(#avatarGrad)"
              strokeWidth={RING_STROKE}
            />
          </Svg>
        </View>

        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.memberSince}>Member since March 2026</Text>

        {/* Info cards */}
        <View style={styles.cards}>
          {infoRows.map((row, index) => (
            <View key={index} style={[styles.card, { width: contentWidth }]}>
              <View style={[styles.iconBox, { backgroundColor: row.iconBg }]}>
                <row.icon width={20} height={20} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardLabel}>{row.label}</Text>
                <Text style={styles.cardValue}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.buttons}>
          <CommonButton
            title="Edit Profile"
            variant="gradient"
            onPress={() => { }}
          />
          <TouchableOpacity
            style={[styles.signOutButton, { width: contentWidth }]}
            activeOpacity={0.8}
            onPress={async () => {
              await removeToken();
              navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
            }}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    width: AVATAR_SIZE + RING_STROKE * 2,
    height: AVATAR_SIZE + RING_STROKE * 2,
    marginTop: 16,
    marginBottom: 12,
  },
  avatarInner: {
    position: 'absolute',
    left: RING_STROKE,
    top: RING_STROKE,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    fontSize: 32,
    fontWeight: '600',
    color: '#888',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 13,
    color: '#9a9a9a',
    marginBottom: 28,
  },
  cards: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: '#8a8a8a',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
  buttons: {
    alignItems: 'center',
  },
  signOutButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4a4a4a',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF7043',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
});
