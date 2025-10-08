import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

type LeaderboardTab = 'global' | 'friends';

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('global');
  const [isLoading] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">Leaderboard</Text>
        </View>

        {/* Tab Selector */}
        <View className="flex-row bg-white px-4 py-2">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg mr-2 ${
              activeTab === 'global' ? 'bg-blue-500' : 'bg-gray-200'
            }`}
            onPress={() => setActiveTab('global')}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === 'global' ? 'text-white' : 'text-gray-700'
              }`}
            >
              Global
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ml-2 ${
              activeTab === 'friends' ? 'bg-blue-500' : 'bg-gray-200'
            }`}
            onPress={() => setActiveTab('friends')}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === 'friends' ? 'text-white' : 'text-gray-700'
              }`}
            >
              Friends
            </Text>
          </TouchableOpacity>
        </View>

        {/* Leaderboard List */}
        <View className="flex-1 px-4 py-4">
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500 text-lg">
                {activeTab === 'global'
                  ? 'Loading global leaderboard...'
                  : 'Invite friends to see their progress!'}
              </Text>
              <Text className="text-gray-400 text-sm mt-2">
                Coming soon in Day 6-7
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
