// Verification Modal Component
// Day 2 Implementation: UI only (no backend logic yet)
// Owner: Alex (Lead Engineer)
// Design: Taylor (Visual Designer), Jordan (UX Designer)
// Created: October 7, 2025

import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { Icon } from '@roninoss/icons';

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  onVerify?: () => void; // Day 2: Stub, Day 3: Real Firestore logic
}

export function VerifyModal({
  isOpen,
  onClose,
  currentStreak,
  onVerify,
}: VerifyModalProps) {
  const handleVerify = () => {
    // Day 2: Console log only
    console.log('✅ User verified Bible reading');

    // Day 3: Will call actual verification logic
    if (onVerify) {
      onVerify();
    }

    // Close modal after action
    onClose();
  };

  const handleNotYet = () => {
    console.log('User selected "Not Yet"');
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
            Did you read your Bible today?
          </Text>

          {/* Primary Button */}
          <Pressable
            onPress={handleVerify}
            className="bg-[#2196F3] active:bg-[#1E88E5] py-4 px-6 rounded-xl mb-3 active:opacity-90"
            accessibilityLabel="Verify Bible reading for today"
            accessibilityRole="button"
          >
            <Text className="text-white text-[17px] font-semibold text-center">
              ✅ Yes, I Read Today
            </Text>
          </Pressable>

          {/* Secondary Button */}
          <Pressable
            onPress={handleNotYet}
            className="bg-gray-100 active:bg-gray-200 py-4 px-6 rounded-xl active:opacity-90"
            accessibilityLabel="Dismiss verification modal"
            accessibilityRole="button"
          >
            <Text className="text-gray-700 text-[17px] font-medium text-center">
              Not Yet
            </Text>
          </Pressable>

          {/* Streak Context */}
          <Text className="text-[15px] text-gray-500 text-center mt-4">
            Current Streak: {currentStreak} {currentStreak === 1 ? 'day' : 'days'} 🔥
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Day 3 will add:
// - Firestore write logic in onVerify
// - Confetti animation after verification
// - Haptic feedback (expo-haptics)
// - Loading state during Firestore write
// - Error handling
// - "Already verified today" state
