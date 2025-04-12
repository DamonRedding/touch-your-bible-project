import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/auth';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(home)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
} 