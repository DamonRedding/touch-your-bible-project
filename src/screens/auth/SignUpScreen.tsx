import { router } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '../../contexts/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      await signUp(email, password);
      Alert.alert(
        'Success',
        'Account created successfully! Please verify your email before signing in.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/sign-in')
          }
        ]
      );
    } catch (err: any) {
      console.error('Sign up error:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to sign up. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center p-4">
          <Text className="text-2xl font-bold mb-6 text-center">Create Account</Text>
          <Text className="text-gray-600 mb-8 text-center">
            Sign up to get started with your Bible journey
          </Text>
          
          <TextInput
            className="bg-white border border-gray-300 rounded-lg p-3 mb-4"
            autoCapitalize="none"
            value={email}
            placeholder="Enter email"
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            editable={!isLoading}
          />

          <TextInput
            className="bg-white border border-gray-300 rounded-lg p-3 mb-4"
            value={password}
            placeholder="Enter password"
            secureTextEntry={true}
            onChangeText={setPassword}
            autoComplete="password-new"
            editable={!isLoading}
          />

          <TextInput
            className="bg-white border border-gray-300 rounded-lg p-3 mb-6"
            value={confirmPassword}
            placeholder="Confirm password"
            secureTextEntry={true}
            onChangeText={setConfirmPassword}
            autoComplete="password-new"
            editable={!isLoading}
          />

          <TouchableOpacity
            className={`bg-blue-500 rounded-lg p-4 mb-4 ${isLoading ? 'opacity-70' : ''}`}
            onPress={onSignUpPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold">Create Account</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center items-center gap-2">
            <Text className="text-gray-600">Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/sign-in')}>
              <Text className="text-blue-500 font-semibold">Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 