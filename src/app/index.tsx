import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/auth';
import { View, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { hasCompletedOnboarding } from './onboarding';

export default function Index() {
  const { user, isLoading } = useAuth();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Check onboarding status on mount
  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const completed = await hasCompletedOnboarding();
    setOnboardingComplete(completed);
    setOnboardingChecked(true);
  };

  // Show loading while checking auth + onboarding
  if (isLoading || !onboardingChecked) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  // If user is logged in, go to home
  if (user) {
    return <Redirect href="/(home)" />;
  }

  // If onboarding not completed, show onboarding
  if (!onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  // Otherwise, show sign in
  return <Redirect href="/(auth)/sign-in" />;
} 