import React, { useCallback, useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../contexts/auth';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(console.warn);

export default function RootLayout() {
  const onLayoutRootView = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch (e) {
      console.warn('Error hiding splash screen:', e);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView className="flex-1" onLayout={onLayoutRootView}>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
} 