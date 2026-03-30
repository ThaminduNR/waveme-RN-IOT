import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStackParamList';
import CommonHeader from '../components/CommonHeader';
import CommonTextInput from '../components/TextInput';
import CommonButton from '../components/CommonButton';
import { resetPassword } from '../services/authService';
import { getErrorMessage } from '../utils/apiError';

type EnterNewPasswordRouteProp = RouteProp<RootStackParamList, 'EnterNewPassword'>;

const EnterNewPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<EnterNewPasswordRouteProp>();
  const { email, code } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Missing fields', 'Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      await resetPassword({
        email,
        code,
        newPassword,
        confirmPassword,
      });
      Alert.alert('Success', 'Your password has been reset.', [
        {
          text: 'OK',
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            }),
        },
      ]);
    } catch (e) {
      Alert.alert('Reset failed', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CommonHeader onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>New Password</Text>
          <Text style={styles.subtitle}>Welcome back to WaveMe</Text>

          <View style={styles.form}>
            <CommonTextInput
              label="Enter New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <CommonTextInput
              label="Re Enter New Password"
              placeholder="Enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.spacer} />

          <View style={styles.buttonWrap}>
            <CommonButton
            title={loading ? 'Saving…' : 'Continue'}
            variant="gradient"
            onPress={handleContinue}
          />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EnterNewPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#9a9a9a',
    marginBottom: 28,
  },
  form: {
    marginBottom: 16,
  },
  spacer: {
    flex: 1,
  },
  buttonWrap: {
    alignItems: 'center',
  },
});
