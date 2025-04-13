import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView as ExpoCameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BibleCameraView() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  const handleVerifyText = async () => {
    try {
      // Simulate text verification for now
      // TODO: Implement actual text verification with Google Cloud Vision API
      Alert.alert(
        'Success',
        'Bible text verified successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(home)')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to verify text. Please try again.');
    }
  };

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-center mb-4">
          We need camera access to verify your Bible text.
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-lg"
          onPress={requestPermission}
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1">
      <ExpoCameraView
        className="flex-1"
        facing={facing}
      >
        <View className="flex-1 bg-transparent">
          <View className="flex-1" />
          <View className="flex-row justify-around items-center mb-8">
            <TouchableOpacity
              className="bg-white/20 p-4 rounded-full"
              onPress={() => {
                setFacing(current => (current === 'back' ? 'front' : 'back'));
              }}
            >
              <Text className="text-white">Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white/20 p-4 rounded-full"
              onPress={handleVerifyText}
            >
              <Text className="text-white">Verify Text</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ExpoCameraView>
    </View>
  );
} 