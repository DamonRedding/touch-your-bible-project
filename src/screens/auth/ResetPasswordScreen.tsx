import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  const onResetPress = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(email);
      Alert.alert(
        'Success',
        'Password reset email sent. Please check your inbox.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/sign-in')
          }
        ]
      );
    } catch (err: any) {
      console.error('Reset password error:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to send reset email. Please try again.'
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
          <Text className="text-2xl font-bold mb-6 text-center">Reset Password</Text>
          <Text className="text-gray-600 mb-8 text-center">
            Enter your email address and we'll send you instructions to reset your password
          </Text>
          
          <TextInput
            className="bg-white border border-gray-300 p-4 rounded-lg mb-6"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
            autoComplete="email"
          />

          <TouchableOpacity
            className={`bg-blue-500 p-4 rounded-lg items-center mb-4 ${isLoading ? 'opacity-70' : ''}`}
            onPress={onResetPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg">Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            className="items-center"
            onPress={() => router.push('/sign-in')}
            disabled={isLoading}
          >
            <Text className="text-blue-500">Back to Sign in</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 