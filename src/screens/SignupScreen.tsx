import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStackParamList';
import CommonHeader from '../components/CommonHeader';
import CommonTextInput from '../components/TextInput';
import CommonButton from '../components/CommonButton';

const SignupScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleContinue = () => {
    // TODO: validate and submit
    navigation.navigate('Login');
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
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>Create your WaveMe account</Text>

          <View style={styles.form}>
            <CommonTextInput
              label="Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
            <CommonTextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <CommonTextInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Text style={styles.legal}>
            By continuing, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>.
          </Text>

          <View style={styles.separator}>
            <View style={styles.line} />
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

export default SignupScreen;

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
    fontWeight: '400',
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
  legal: {
    fontSize: 12,
    color: '#8a8a8a',
    lineHeight: 18,
    marginBottom: 24,
  },
  link: {
    color: '#b0a0c0',
    textDecorationLine: 'underline',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 50,
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
