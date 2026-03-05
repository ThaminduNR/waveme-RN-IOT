import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStackParamList';
import CommonHeader from '../components/CommonHeader';
import CommonTextInput from '../components/TextInput';
import CommonButton from '../components/CommonButton';

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleContinue = () => {
    // TODO: validate and submit login
    navigation.navigate('Home');
  };

  const handleForgotPassword = () => {
    // TODO: navigate to forgot password screen
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
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>Welcome back to WaveMe</Text>

          <View style={styles.form}>
            <CommonTextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <CommonTextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotWrap}>
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={styles.separator}>
            <View style={styles.line} />
            {/* <Text style={styles.or}>or</Text> */}
            <View style={styles.line} />
          </View>

          <View style={styles.buttonWrap}>
            <CommonButton title="Continue" variant="gradient" onPress={handleContinue} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;

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
    fontSize: 50,
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
    marginBottom: 8,
  },
  forgotWrap: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  forgotLink: {
    fontSize: 14,
    color: '#b0a0c0',
    textDecorationLine: 'underline',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 50,
    marginTop: 50,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  or: {
    fontSize: 13,
    color: '#8a8a8a',
    marginHorizontal: 12,
  },
  buttonWrap: {
    alignItems: 'center',
    marginTop: 80,
  },
});
