import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInAnonymously } = useAuth();

  const onSignInPress = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      await signIn(email, password);
    } catch (err: any) {
      console.error('Sign in error:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to sign in. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onAnonymousSignInPress = async () => {
    try {
      setIsLoading(true);
      await signInAnonymously();
    } catch (err: any) {
      console.error('Anonymous sign in error:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to sign in anonymously. Please try again.'
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
        <View className="flex-1 justify-center px-4">
          <Text className="text-2xl font-bold mb-6 text-center">Welcome Back</Text>
          <Text className="text-gray-600 mb-8 text-center">
            Sign in to continue to your account
          </Text>
          
          <TextInput
            className="bg-white border border-gray-300 p-4 rounded-lg mb-4"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
            autoComplete="email"
          />
          
          <TextInput
            className="bg-white border border-gray-300 p-4 rounded-lg mb-6"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!isLoading}
            autoComplete="password"
          />

          <TouchableOpacity
            className={`bg-blue-500 p-4 rounded-lg items-center mb-4 ${isLoading ? 'opacity-70' : ''}`}
            onPress={onSignInPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg">Sign in</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            className="mb-4 items-center"
            onPress={() => router.push('/sign-up')}
            disabled={isLoading}
          >
            <Text className="text-blue-500">Don't have an account? Sign up</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="items-center mb-4"
            onPress={() => router.push('/reset-password')}
            disabled={isLoading}
          >
            <Text className="text-blue-500">Forgot password?</Text>
          </TouchableOpacity>

          <View className="flex-row items-center my-4">
            <View className="flex-1 h-[1px] bg-gray-300" />
            <Text className="mx-4 text-gray-500">or</Text>
            <View className="flex-1 h-[1px] bg-gray-300" />
          </View>

          <TouchableOpacity
            className={`border border-gray-300 p-4 rounded-lg items-center ${isLoading ? 'opacity-70' : ''}`}
            onPress={onAnonymousSignInPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text className="text-gray-700 font-semibold">Continue as Guest</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 