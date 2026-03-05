import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '../navigation/RootStackParamList'

const SignupScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  return (
    <View>
      <Text>SignupScreen</Text>
      <Button title="Login" onPress={() => navigation.navigate('Login')} />
    </View>
  )
}

export default SignupScreen

const styles = StyleSheet.create({})