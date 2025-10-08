// Dashboard Screen - Day 3 with Firestore Integration
// Owner: Alex (Lead Engineer)
// Design: Taylor (Visual Designer)
// Created: October 7, 2025 | Updated: October 8, 2025

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../contexts/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VerifyModal } from '../components/VerifyModal';
import { Confetti } from '../components/Confetti';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  getTotalVerifications,
} from '../services/verification';
import * as Haptics from 'expo-haptics';
import { Text, Button, Card, CardContent, CardTitle } from '../components/nativewindui';

export default function DashboardScreen() {
  const { user, profile, signOut, isLoading } = useAuth();
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalVerifications: 0,
    points: 0,
    rank: null as number | null,
  });

  // Load user data from Firestore
  const loadUserData = async (isRefresh = false) => {
    if (!user) return;

    if (isRefresh) {
      setIsRefreshing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setIsLoadingData(true);
    }

    try {
      const [currentStreak, longestStreak, totalVerifications] = await Promise.all([
        calculateCurrentStreak(user.uid),
        calculateLongestStreak(user.uid),
        getTotalVerifications(user.uid),
      ]);

      setUserData({
        currentStreak,
        longestStreak,
        totalVerifications,
        points: totalVerifications * 10, // 10 points per verification
        rank: null, // Leaderboard integration later
      });
      setError(null);
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load data. Pull down to retry.');
      // Keep previous data on error
    } finally {
      setIsLoadingData(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadUserData(true);
  };

  // Load data on mount and when user changes
  useEffect(() => {
    loadUserData();
  }, [user]);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleVerifyPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsVerifyModalOpen(true);
  };

  const handleVerifySuccess = () => {
    // Success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Trigger confetti
    setShowConfetti(true);

    // Reload data to update streaks
    loadUserData();

    // Stop confetti after 3 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  if (isLoading || isLoadingData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return null; // Auth should redirect
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#2196F3"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="p-4">
          {/* Error Banner */}
          {error && (
            <Card className="mb-4 bg-red-50 border-red-200">
              <CardContent className="flex-row items-center">
                <Text className="text-2xl mr-3">⚠️</Text>
                <View className="flex-1">
                  <Text variant="subhead" className="font-semibold text-red-900 mb-1">
                    Connection Error
                  </Text>
                  <Text variant="footnote" className="text-red-700">
                    {error}
                  </Text>
                </View>
              </CardContent>
            </Card>
          )}

          {/* Greeting */}
          <Text
            variant="largeTitle"
            className="mb-2"
            accessibilityRole="header"
            accessibilityLabel={`${getGreeting()} greeting`}
          >
            {getGreeting()}! 👋
          </Text>
          <Text variant="body" color="secondary" className="mb-6">
            {user?.displayName || user?.email?.split('@')[0] || 'Friend'}
          </Text>

          {/* Streak Card */}
          <Card
            accessibilityRole="text"
            accessibilityLabel={`Current streak: ${userData.currentStreak} ${userData.currentStreak === 1 ? 'day' : 'days'}`}
            className="mb-4"
          >
            <CardContent>
              <Text
                variant="caption1"
                color="secondary"
                className="text-center mb-2 uppercase tracking-wide"
              >
                Current Streak
              </Text>
              <Text className="text-[48px] font-bold text-center mb-2">
                {userData.currentStreak}
              </Text>
              <View className="flex-row justify-center mb-2">
                {/* Show flames based on streak (max 5) */}
                {userData.currentStreak > 0 && (
                  <Text className="text-[32px]" accessibilityLabel="Streak fire emoji">
                    {'🔥'.repeat(Math.min(userData.currentStreak, 5))}
                  </Text>
                )}
              </View>
              <Text variant="footnote" color="secondary" className="text-center">
                {userData.currentStreak === 0
                  ? '🎯 Start your streak today!'
                  : `${userData.currentStreak} ${userData.currentStreak === 1 ? 'day' : 'days'} in a row`}
              </Text>
            </CardContent>
          </Card>

          {/* Verify Button (Primary CTA) */}
          <Button
            variant="primary"
            size="lg"
            onPress={handleVerifyPress}
            className="mb-4 shadow-lg w-full"
            accessibilityLabel="Open verification modal to verify today's Bible reading"
            accessibilityHint="Double tap to open camera and verify your Bible reading"
          >
            <View className="items-center">
              <Text variant="headline" className="text-white font-bold">
                ✅ Verify Bible Reading
              </Text>
              <Text variant="caption1" className="text-white/80 mt-1">
                Tap to verify today's reading
              </Text>
            </View>
          </Button>

          {/* Quick Stats Row */}
          <View className="flex-row justify-between px-2" accessibilityRole="summary">
            {/* Total Days */}
            <View
              className="items-center"
              accessibilityLabel={`Total verifications: ${userData.totalVerifications} days`}
            >
              <Text variant="title2" className="font-bold">
                {userData.totalVerifications}
              </Text>
              <Text variant="caption1" color="secondary">
                Total Days
              </Text>
            </View>

            {/* Points */}
            <View className="items-center" accessibilityLabel={`Total points: ${userData.points}`}>
              <Text variant="title2" className="font-bold">
                {userData.points}
              </Text>
              <Text variant="caption1" color="secondary">
                Points
              </Text>
            </View>

            {/* Rank */}
            <View
              className="items-center"
              accessibilityLabel={
                userData.rank
                  ? `Global rank: ${userData.rank}`
                  : 'Complete 3 days to unlock global rank'
              }
            >
              <Text variant="title2" className="font-bold">
                {userData.rank ? `#${userData.rank}` : '---'}
              </Text>
              <Text variant="caption1" color="secondary">
                Global Rank
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Verification Modal */}
      <VerifyModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        userId={user.uid}
        currentStreak={userData.currentStreak}
        onVerifySuccess={handleVerifySuccess}
      />

      {/* Confetti Animation */}
      {showConfetti && <Confetti />}
    </SafeAreaView>
  );
}

// ✅ Day 3 Complete:
// - Firestore data loading (streaks, verifications, points)
// - Confetti trigger on successful verification
// - Real-time data refresh after verification
// TODO: Add haptic feedback (next task) 