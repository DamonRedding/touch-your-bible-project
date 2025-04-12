import './global.css';
import React from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot } from 'expo-router';

// Ignore specific warnings if they're expected
LogBox.ignoreLogs([
  'Error preventing splash screen from auto-hiding',
]);

// Prevent auto-hiding of splash screen
SplashScreen.preventAutoHideAsync().catch(() => {
  console.warn('Error preventing splash screen from auto-hiding');
});

// Configure query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      gcTime: 300000, // 5 minutes
      staleTime: 0,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <SafeAreaProvider className="flex-1">
          <Slot />
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
