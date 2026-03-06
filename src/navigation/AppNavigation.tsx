import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './RootStackParamList';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CameraComponent from '../components/cameraComponent/CameraComponent';
import SpalshScreen from '../screens/SpalshScreen';
import ForgetPasswordScreen from '../screens/ForgetPasswordScreen';
import EnterNewPasswordScreen from '../screens/EnterNewPasswordScreen';
import EnterCodeScreen from '../screens/EnterCodeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Camera" component={CameraComponent} />
                <Stack.Screen name="Splash" component={SpalshScreen} />
                <Stack.Screen name="EnterNewPassword" component={EnterNewPasswordScreen} />
                <Stack.Screen name="EnterCode" component={EnterCodeScreen} />
                <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigation;
