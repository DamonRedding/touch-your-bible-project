import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/auth';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleInviteFriends = () => {
    // TODO: Implement invite modal (Day 8)
    console.log('Invite friends - coming soon');
  };

  const handleCopyInviteCode = () => {
    // TODO: Implement clipboard copy (Day 8)
    console.log('Copy invite code - coming soon');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">Profile</Text>
        </View>

        {/* User Info Card */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            User Information
          </Text>
          {user?.email && (
            <View className="mb-3">
              <Text className="text-sm text-gray-500">Email</Text>
              <Text className="text-base text-gray-900">{user.email}</Text>
            </View>
          )}
          <View className="mb-3">
            <Text className="text-sm text-gray-500">Invite Code</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-gray-900 font-mono">TOUCH-XXXX</Text>
              <TouchableOpacity
                className="bg-blue-100 px-3 py-1 rounded"
                onPress={handleCopyInviteCode}
              >
                <Text className="text-blue-600 text-sm font-semibold">Copy</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-gray-400 mt-1">
              Coming soon - Day 8
            </Text>
          </View>
        </View>

        {/* Stats Card */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Your Stats
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Current Streak</Text>
            <Text className="text-gray-900 font-semibold">0 days</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Longest Streak</Text>
            <Text className="text-gray-900 font-semibold">0 days</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Total Points</Text>
            <Text className="text-gray-900 font-semibold">0</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Global Rank</Text>
            <Text className="text-gray-900 font-semibold">N/A</Text>
          </View>
          <Text className="text-xs text-gray-400 mt-2">
            Stats will update after verification
          </Text>
        </View>

        {/* Actions */}
        <View className="mx-4 mt-4">
          <TouchableOpacity
            className="bg-blue-500 p-4 rounded-lg mb-3"
            onPress={handleInviteFriends}
          >
            <Text className="text-white text-center font-semibold">
              Invite Friends (+10 points each)
            </Text>
            <Text className="text-white text-center text-xs mt-1 opacity-80">
              Coming soon - Day 8
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-red-500 p-4 rounded-lg"
            onPress={handleSignOut}
          >
            <Text className="text-white text-center font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
