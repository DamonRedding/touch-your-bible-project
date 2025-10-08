// Onboarding Screen
// First-time user experience
// Owner: Jordan (UX Designer)
// Created: October 8, 2025

import React from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingCarousel, DEFAULT_ONBOARDING_SLIDES } from '../components/OnboardingCarousel';

const ONBOARDING_COMPLETED_KEY = '@touch_your_bible:onboarding_completed';

export default function OnboardingScreen() {
  const handleComplete = async () => {
    try {
      // Mark onboarding as completed
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');

      // Navigate to sign in
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
      // Continue anyway - don't block the user
      router.replace('/(auth)/sign-in');
    }
  };

  return (
    <OnboardingCarousel
      slides={DEFAULT_ONBOARDING_SLIDES}
      onComplete={handleComplete}
    />
  );
}

// Helper function to check if onboarding has been completed
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Failed to check onboarding state:', error);
    // Default to false - show onboarding if check fails
    return false;
  }
}

// Helper function to reset onboarding (for testing)
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  } catch (error) {
    console.error('Failed to reset onboarding:', error);
  }
}
