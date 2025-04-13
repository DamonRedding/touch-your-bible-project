import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { user, profile, signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 p-4">
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-2xl font-bold mb-4">Welcome!</Text>
          {user?.email && (
            <Text className="text-lg mb-4">Email: {user.email}</Text>
          )}
        </View>

        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg mt-4"
          onPress={() => router.push('/camera')}
        >
          <Text className="text-white text-center font-semibold">Verify Bible Text</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-500 p-4 rounded-lg mt-4"
          onPress={handleSignOut}
        >
          <Text className="text-white text-center font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 