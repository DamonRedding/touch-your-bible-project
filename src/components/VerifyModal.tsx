// Verification Modal Component
// Day 3 Implementation: Full Firestore integration with timezone awareness
// Day 4 Update: Camera integration with OCR validation
// Owner: Alex (Lead Engineer)
// Design: Taylor (Visual Designer), Jordan (UX Designer)
// Created: October 7, 2025 | Updated: October 8, 2025

import React, { useState, useRef } from 'react';
import { Modal, View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Icon } from '@roninoss/icons';
import * as Haptics from 'expo-haptics';
import { createVerification, checkAlreadyVerifiedToday } from '../services/verification';
import { verifyBibleText, getOCRFeedbackMessage } from '../services/ocr';

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentStreak: number;
  onVerifySuccess: () => void; // Called after successful verification to trigger confetti + refresh
}

type VerificationStep = 'initial' | 'camera' | 'verifying' | 'manual-override';

export function VerifyModal({
  isOpen,
  onClose,
  userId,
  currentStreak,
  onVerifySuccess,
}: VerifyModalProps) {
  const [step, setStep] = useState<VerificationStep>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

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
      setStep('initial');
      setAlreadyVerified(false);
      setError(null);
    }
  }, [isOpen, userId]);

  const handleOpenCamera = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Request camera permission if not granted
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera access to verify your Bible reading with a photo.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setStep('camera');
  };

  const handleTakePicture = async () => {
    if (!cameraRef.current) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setStep('verifying');
      setIsLoading(true);
      setError(null);

      // Take picture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
      });

      if (!photo) {
        throw new Error('Failed to capture photo');
      }

      // Verify with OCR
      const ocrResult = await verifyBibleText(photo.uri);
      const feedback = getOCRFeedbackMessage(ocrResult);

      if (ocrResult.isBibleText) {
        // Success - create verification
        await createVerification(userId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onVerifySuccess();
        setTimeout(() => onClose(), 300);
      } else {
        // Low confidence - offer manual override
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setError(feedback.message);
        setStep('manual-override');
      }
    } catch (err) {
      console.error('Camera verification error:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err instanceof Error ? err.message : 'Failed to verify photo');
      setStep('manual-override');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerify = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    setError(null);

    try {
      await createVerification(userId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onVerifySuccess();
      setTimeout(() => onClose(), 300);
    } catch (err) {
      console.error('Manual verification error:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err instanceof Error ? err.message : 'Failed to save verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('initial');
    setError(null);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  // Render camera view
  if (step === 'camera' && isOpen) {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={isOpen}
        onRequestClose={handleBack}
        statusBarTranslucent={true}
      >
        <View className="flex-1 bg-black">
          <CameraView
            ref={cameraRef}
            className="flex-1"
            facing={cameraFacing}
          >
            {/* Header */}
            <View className="absolute top-0 left-0 right-0 pt-12 pb-4 px-4 bg-black/50">
              <View className="flex-row items-center justify-between">
                <Pressable onPress={handleBack} className="p-2">
                  <Icon name="chevron-left" size={28} color="#fff" />
                </Pressable>
                <Text className="text-white text-lg font-semibold">
                  Take Photo of Bible
                </Text>
                <Pressable
                  onPress={() => setCameraFacing(prev => prev === 'back' ? 'front' : 'back')}
                  className="p-2"
                >
                  <Icon name="repeat" size={24} color="#fff" />
                </Pressable>
              </View>
            </View>

            {/* Instructions */}
            <View className="absolute top-32 left-0 right-0 px-6">
              <View className="bg-black/70 rounded-2xl p-4">
                <Text className="text-white text-center text-base">
                  📖 Position your Bible so the text is clearly visible
                </Text>
              </View>
            </View>

            {/* Capture Button */}
            <View className="absolute bottom-0 left-0 right-0 pb-8 px-4">
              <Pressable
                onPress={handleTakePicture}
                disabled={isLoading}
                className="bg-white w-20 h-20 rounded-full self-center items-center justify-center active:opacity-80"
              >
                <View className="bg-white w-16 h-16 rounded-full border-4 border-black" />
              </Pressable>
              <Text className="text-white text-center mt-4 text-sm">
                Tap to capture
              </Text>
            </View>
          </CameraView>
        </View>
      </Modal>
    );
  }

  // Main modal (initial, verifying, manual-override states)
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isOpen}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      {/* Backdrop */}
      <Pressable
        className="flex-1 justify-center items-center bg-black/50"
        onPress={handleClose}
        accessible={false}
      >
        {/* Modal Content */}
        <Pressable
          className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm shadow-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Verifying State */}
          {step === 'verifying' && (
            <>
              <View className="items-center mb-4">
                <ActivityIndicator size="large" color="#2196F3" />
              </View>
              <Text className="text-[22px] font-semibold text-gray-900 text-center mb-2">
                Verifying Bible Text...
              </Text>
              <Text className="text-[15px] text-gray-600 text-center">
                Analyzing your photo with OCR
              </Text>
            </>
          )}

          {/* Manual Override State */}
          {step === 'manual-override' && (
            <>
              <View className="items-center mb-4">
                <Icon name="help-circle" size={64} color="#FFA726" />
              </View>
              <Text className="text-[22px] font-semibold text-gray-900 text-center mb-4">
                ⚠️ Verification Uncertain
              </Text>
              {error && (
                <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <Text className="text-yellow-800 text-[15px] text-center">{error}</Text>
                </View>
              )}
              <Text className="text-[15px] text-gray-600 text-center mb-6">
                We couldn't clearly detect Bible text. Did you read your Bible today?
              </Text>
              <Pressable
                onPress={handleManualVerify}
                disabled={isLoading}
                className="bg-[#2196F3] active:bg-[#1E88E5] py-4 px-6 rounded-xl mb-3"
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-[17px] font-semibold text-center">
                    ✅ Yes, I Read Today
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={handleBack}
                disabled={isLoading}
                className="bg-gray-100 active:bg-gray-200 py-4 px-6 rounded-xl mb-3"
              >
                <Text className="text-gray-700 text-[17px] font-medium text-center">
                  📷 Try Photo Again
                </Text>
              </Pressable>
              <Pressable
                onPress={handleClose}
                disabled={isLoading}
                className="bg-transparent py-2"
              >
                <Text className="text-gray-500 text-[15px] text-center">Cancel</Text>
              </Pressable>
            </>
          )}

          {/* Initial State */}
          {step === 'initial' && (
            <>
              <View className="items-center mb-4">
                <Icon name="book-open" size={64} color="#2196F3" />
              </View>
              <Text className="text-[22px] font-semibold text-gray-900 text-center mb-6">
                {alreadyVerified ? '✅ Already Verified!' : 'Verify Your Bible Reading'}
              </Text>

              {error && (
                <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <Text className="text-red-800 text-[15px] text-center">{error}</Text>
                </View>
              )}

              {alreadyVerified ? (
                <>
                  <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <Text className="text-green-800 text-[15px] text-center font-medium">
                      🎉 You've already verified today! Come back tomorrow to keep your streak going.
                    </Text>
                  </View>
                  <Pressable
                    onPress={handleClose}
                    className="bg-gray-100 active:bg-gray-200 py-4 px-6 rounded-xl"
                  >
                    <Text className="text-gray-700 text-[17px] font-medium text-center">
                      Close
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text className="text-[15px] text-gray-600 text-center mb-6">
                    Take a photo of your Bible to verify your reading
                  </Text>
                  <Pressable
                    onPress={handleOpenCamera}
                    className="bg-[#2196F3] active:bg-[#1E88E5] py-4 px-6 rounded-xl mb-3 flex-row items-center justify-center"
                  >
                    <Icon name="camera" size={20} color="#fff" />
                    <Text className="text-white text-[17px] font-semibold ml-2">
                      Take Photo
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleManualVerify}
                    disabled={isLoading}
                    className="bg-gray-100 active:bg-gray-200 py-4 px-6 rounded-xl mb-3"
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#666" />
                    ) : (
                      <Text className="text-gray-700 text-[17px] font-medium text-center">
                        Verify Without Photo
                      </Text>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={handleClose}
                    className="bg-transparent py-2"
                  >
                    <Text className="text-gray-500 text-[15px] text-center">Not Yet</Text>
                  </Pressable>
                  <Text className="text-[13px] text-gray-500 text-center mt-4">
                    Current Streak: {currentStreak} {currentStreak === 1 ? 'day' : 'days'} 🔥
                  </Text>
                </>
              )}
            </>
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
//
// ✅ Day 4 Complete (Camera Integration):
// - Full camera integration with expo-camera
// - OCR service with Bible text verification (MVP: keyword matching)
// - Multi-step flow: initial → camera → verifying → manual-override
// - Camera permissions handling with iOS-native UI
// - Manual verification fallback for OCR failures
// - Beautiful camera UI with instructions and controls
// - Production-ready for Google Cloud Vision API integration (commented code included)
