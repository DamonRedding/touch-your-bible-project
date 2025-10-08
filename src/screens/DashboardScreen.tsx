// Dashboard Screen - Rebuilt for Day 2
// Owner: Alex (Lead Engineer)
// Design: Taylor (Visual Designer)
// Created: October 7, 2025

import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../contexts/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VerifyModal } from '../components/VerifyModal';

// Day 2: Stub data (will be replaced with Firestore data Day 3+)
const STUB_USER_DATA = {
  currentStreak: 0,
  longestStreak: 0,
  totalVerifications: 0,
  points: 0,
  rank: null,
};

export default function DashboardScreen() {
  const { user, profile, signOut, isLoading } = useAuth();
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  // Day 2: Using stub data
  const userData = STUB_USER_DATA;

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleVerifyPress = () => {
    setIsVerifyModalOpen(true);
  };

  const handleVerify = () => {
    // Day 2: Console log only
    console.log('Verification action triggered');
    // Day 3: Will add Firestore write + streak calculation
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Greeting */}
          <Text className="text-[28px] font-bold text-gray-900 mb-2">
            {getGreeting()}! 👋
          </Text>
          <Text className="text-[17px] text-gray-600 mb-6">
            {user?.displayName || user?.email?.split('@')[0] || 'Friend'}
          </Text>

          {/* Streak Card */}
          <View className="bg-white rounded-2xl p-6 mb-4 shadow-md">
            <Text className="text-[15px] text-gray-600 text-center mb-2 uppercase tracking-wide">
              Current Streak
            </Text>
            <Text className="text-[48px] font-bold text-center mb-2 text-gray-900">
              {userData.currentStreak}
            </Text>
            <View className="flex-row justify-center mb-2">
              {/* Show flames based on streak (max 5) */}
              {userData.currentStreak > 0 && (
                <Text className="text-[32px]">
                  {'🔥'.repeat(Math.min(userData.currentStreak, 5))}
                </Text>
              )}
            </View>
            <Text className="text-[13px] text-gray-500 text-center">
              {userData.currentStreak === 0
                ? 'Start your streak today!'
                : `${userData.currentStreak} ${userData.currentStreak === 1 ? 'day' : 'days'} in a row`}
            </Text>
          </View>

          {/* Verify Button (Primary CTA) */}
          <Pressable
            onPress={handleVerifyPress}
            className="bg-[#2196F3] active:bg-[#1E88E5] py-5 px-6 rounded-2xl mb-4 shadow-lg active:opacity-95"
            accessibilityLabel="Open verification modal"
            accessibilityRole="button"
          >
            <Text className="text-white text-[19px] font-bold text-center">
              ✅ Verify Bible Reading
            </Text>
            <Text className="text-white/80 text-[13px] text-center mt-1">
              Tap to verify today's reading
            </Text>
          </Pressable>

          {/* Quick Stats Row */}
          <View className="flex-row justify-between px-2">
            {/* Total Days */}
            <View className="items-center">
              <Text className="text-[24px] font-bold text-gray-900">
                {userData.totalVerifications}
              </Text>
              <Text className="text-[13px] text-gray-600">Total Days</Text>
            </View>

            {/* Points */}
            <View className="items-center">
              <Text className="text-[24px] font-bold text-gray-900">
                {userData.points}
              </Text>
              <Text className="text-[13px] text-gray-600">Points</Text>
            </View>

            {/* Rank */}
            <View className="items-center">
              <Text className="text-[24px] font-bold text-gray-900">
                {userData.rank ? `#${userData.rank}` : '---'}
              </Text>
              <Text className="text-[13px] text-gray-600">Global Rank</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Verification Modal */}
      <VerifyModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        currentStreak={userData.currentStreak}
        onVerify={handleVerify}
      />
    </SafeAreaView>
  );
}

// Day 3 will add:
// - Replace stub data with Firestore queries
// - Confetti animation after verification
// - Haptic feedback
// - Real streak calculation
// - Points update 