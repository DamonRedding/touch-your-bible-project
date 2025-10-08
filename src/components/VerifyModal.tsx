// Verification Modal Component
// Day 3 Implementation: Full Firestore integration with timezone awareness
// Owner: Alex (Lead Engineer)
// Design: Taylor (Visual Designer), Jordan (UX Designer)
// Created: October 7, 2025 | Updated: October 8, 2025

import React, { useState } from 'react';
import { Modal, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Icon } from '@roninoss/icons';
import * as Haptics from 'expo-haptics';
import { createVerification, checkAlreadyVerifiedToday } from '../services/verification';

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentStreak: number;
  onVerifySuccess: () => void; // Called after successful verification to trigger confetti + refresh
}

export function VerifyModal({
  isOpen,
  onClose,
  userId,
  currentStreak,
  onVerifySuccess,
}: VerifyModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  // Check if already verified today when modal opens
  React.useEffect(() => {
    if (isOpen && userId) {
      checkAlreadyVerifiedToday(userId)
        .then((verification) => {
          setAlreadyVerified(!!verification);
        })
        .catch((err) => {
          console.error('Error checking verification:', err);
          // Don't block UX if check fails
          setAlreadyVerified(false);
        });
    } else {
      // Reset state when modal closes
      setAlreadyVerified(false);
      setError(null);
    }
  }, [isOpen, userId]);

  const handleVerify = async () => {
    if (alreadyVerified) {
      setError("You've already verified today! Come back tomorrow.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    // Light haptic on button press
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setIsLoading(true);
    setError(null);

    try {
      await createVerification(userId);
      console.log('✅ Verification created successfully');

      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Trigger confetti and refresh in parent
      onVerifySuccess();

      // Close modal after short delay (let confetti start)
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (err) {
      console.error('Verification error:', err);

      // Error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save verification. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotYet = () => {
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      {/* Backdrop */}
      <Pressable
        className="flex-1 justify-center items-center bg-black/50"
        onPress={onClose}
        accessible={false}
      >
        {/* Modal Content - Prevent backdrop press from closing */}
        <Pressable
          className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm shadow-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <View className="items-center mb-4">
            <Icon name="book-open" size={64} color="#2196F3" />
          </View>

          {/* Headline */}
          <Text className="text-[22px] font-semibold text-gray-900 text-center mb-6 leading-7">
            {alreadyVerified ? '✅ Already Verified!' : 'Did you read your Bible today?'}
          </Text>

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Text className="text-red-800 text-[15px] text-center">{error}</Text>
            </View>
          )}

          {/* Already Verified State */}
          {alreadyVerified && !error && (
            <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <Text className="text-green-800 text-[15px] text-center font-medium">
                🎉 You've already verified today! Come back tomorrow to keep your streak going.
              </Text>
            </View>
          )}

          {/* Primary Button */}
          {!alreadyVerified && (
            <Pressable
              onPress={handleVerify}
              disabled={isLoading}
              className={`py-4 px-6 rounded-xl mb-3 ${
                isLoading
                  ? 'bg-gray-300'
                  : 'bg-[#2196F3] active:bg-[#1E88E5] active:opacity-90'
              }`}
              accessibilityLabel="Verify Bible reading for today"
              accessibilityRole="button"
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-[17px] font-semibold text-center">
                  ✅ Yes, I Read Today
                </Text>
              )}
            </Pressable>
          )}

          {/* Secondary Button */}
          <Pressable
            onPress={handleNotYet}
            disabled={isLoading}
            className="bg-gray-100 active:bg-gray-200 py-4 px-6 rounded-xl active:opacity-90"
            accessibilityLabel="Dismiss verification modal"
            accessibilityRole="button"
          >
            <Text className="text-gray-700 text-[17px] font-medium text-center">
              {alreadyVerified ? 'Close' : 'Not Yet'}
            </Text>
          </Pressable>

          {/* Streak Context */}
          {!alreadyVerified && (
            <Text className="text-[15px] text-gray-500 text-center mt-4">
              Current Streak: {currentStreak} {currentStreak === 1 ? 'day' : 'days'} 🔥
            </Text>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ✅ Day 3 Complete:
// - Firestore verification service integrated
// - Timezone-aware "today" logic (user's local timezone)
// - Loading state with ActivityIndicator
// - Error handling with user-friendly messages
// - "Already verified today" check and state
// - Confetti trigger via onVerifySuccess callback
// - Haptic feedback (light on press, success/error/warning notifications)
