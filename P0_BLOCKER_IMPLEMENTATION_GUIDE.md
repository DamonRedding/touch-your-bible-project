# P0 Blocker Implementation Guide
**Touch Your Bible - Critical Launch Blockers**
**Task**: Fix 2 blockers before TestFlight launch
**Estimated Time**: 9-13 hours (1.5 days)

---

## Blocker 1: Camera Verification Integration

### Current State
- ✅ VerifyModal exists (`src/components/VerifyModal.tsx`)
- ✅ CameraView exists (`src/components/CameraView.tsx`)
- ❌ Camera NOT integrated into verification flow
- ❌ OCR validation NOT implemented

### What Needs to Change

#### Step 1: Update VerifyModal.tsx (2 hours)

**Add camera state management:**
```tsx
// Add to imports
import { CameraView, useCameraPermissions } from 'expo-camera';

// Add state variables (after line 30)
const [showCamera, setShowCamera] = useState(false);
const [photoUri, setPhotoUri] = useState<string | null>(null);
const [isProcessingOCR, setIsProcessingOCR] = useState(false);
const [permission, requestPermission] = useCameraPermissions();
```

**Replace manual verification button (lines 144-164) with camera trigger:**
```tsx
{!alreadyVerified && (
  <>
    {/* Camera Trigger Button */}
    <Pressable
      onPress={() => {
        if (!permission?.granted) {
          requestPermission();
        } else {
          setShowCamera(true);
        }
      }}
      disabled={isLoading}
      className="bg-[#2196F3] active:bg-[#1E88E5] py-4 px-6 rounded-xl mb-3"
    >
      <Text className="text-white text-[17px] font-semibold text-center">
        📷 Open Camera to Verify
      </Text>
    </Pressable>

    {/* Helper text */}
    <Text className="text-[13px] text-gray-500 text-center mb-3">
      Take a photo of your open Bible page
    </Text>
  </>
)}
```

**Add camera view modal (before closing Modal tag):**
```tsx
{/* Camera View Modal */}
{showCamera && permission?.granted && (
  <Modal
    animationType="slide"
    visible={showCamera}
    onRequestClose={() => setShowCamera(false)}
  >
    <View className="flex-1">
      <CameraView
        className="flex-1"
        facing="back"
      >
        <SafeAreaView className="flex-1">
          {/* Camera controls */}
          <View className="flex-1 justify-end pb-8">
            <View className="items-center">
              {isProcessingOCR ? (
                <View className="bg-white/90 rounded-2xl p-6">
                  <ActivityIndicator size="large" color="#2196F3" />
                  <Text className="text-gray-900 mt-3">Analyzing Bible text...</Text>
                </View>
              ) : (
                <>
                  {/* Capture button */}
                  <Pressable
                    onPress={handleTakePhoto}
                    className="bg-white rounded-full w-20 h-20 items-center justify-center mb-4 shadow-lg"
                  >
                    <View className="bg-[#2196F3] rounded-full w-16 h-16" />
                  </Pressable>

                  {/* Cancel button */}
                  <Pressable
                    onPress={() => setShowCamera(false)}
                    className="bg-white/90 rounded-full px-6 py-3"
                  >
                    <Text className="text-gray-900 font-semibold">Cancel</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  </Modal>
)}
```

**Add photo capture handler:**
```tsx
const cameraRef = useRef<CameraView>(null);

const handleTakePhoto = async () => {
  if (!cameraRef.current) return;

  try {
    setIsProcessingOCR(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Capture photo
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.7,
      base64: true,
    });

    if (!photo?.base64) {
      throw new Error('Failed to capture photo');
    }

    // Send to OCR service
    const ocrResult = await validateBiblePhoto(photo.base64);

    if (ocrResult.success) {
      // Photo validated - create verification
      await createVerification(userId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setShowCamera(false);
      onVerifySuccess(); // Trigger confetti

      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      // OCR failed - show error
      setError(ocrResult.error || 'Could not detect Bible text. Try better lighting.');
      setShowCamera(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  } catch (err) {
    console.error('Photo capture error:', err);
    setError('Failed to capture photo. Please try again.');
    setShowCamera(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } finally {
    setIsProcessingOCR(false);
  }
};
```

#### Step 2: Create OCR Service (2-3 hours)

**Create file: `src/services/ocr.ts`**

```typescript
// OCR Service using Google Cloud Vision API
import { GOOGLE_CLOUD_VISION_API_KEY } from '../config/env';

interface OCRResult {
  success: boolean;
  text?: string;
  error?: string;
  confidence?: number;
}

const BIBLE_KEYWORDS = [
  // Books of the Bible (sample - add all 66)
  'genesis', 'exodus', 'leviticus', 'matthew', 'mark', 'luke', 'john',
  'acts', 'romans', 'corinthians', 'revelation',
  // Common Bible phrases
  'verse', 'chapter', 'lord', 'god', 'jesus', 'christ',
  // Verse patterns
  /\d+:\d+/, // Matches "1:1", "3:16", etc.
];

/**
 * Validate that a photo contains Bible text using Google Cloud Vision OCR
 */
export async function validateBiblePhoto(base64Image: string): Promise<OCRResult> {
  try {
    // Call Google Cloud Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OCR API error: ${response.status}`);
    }

    const data = await response.json();
    const textAnnotations = data.responses[0]?.textAnnotations;

    if (!textAnnotations || textAnnotations.length === 0) {
      return {
        success: false,
        error: 'No text detected in photo. Make sure your Bible page is clearly visible.',
      };
    }

    // Extract detected text
    const detectedText = textAnnotations[0].description.toLowerCase();

    // Check for Bible-related keywords
    const hasBibleKeywords = BIBLE_KEYWORDS.some((keyword) => {
      if (typeof keyword === 'string') {
        return detectedText.includes(keyword.toLowerCase());
      } else {
        // Regex pattern
        return keyword.test(detectedText);
      }
    });

    if (!hasBibleKeywords) {
      return {
        success: false,
        error: 'Could not detect Bible text. Make sure you\'re photographing a Bible page.',
        text: detectedText.substring(0, 100), // First 100 chars for debugging
      };
    }

    // Success - Bible text detected
    return {
      success: true,
      text: detectedText,
      confidence: textAnnotations[0].confidence || 0.9,
    };
  } catch (error) {
    console.error('OCR validation error:', error);
    return {
      success: false,
      error: 'OCR service unavailable. Try again or use manual verification.',
    };
  }
}

/**
 * Fallback: Manual verification if OCR fails 3+ times
 * (Future implementation - allow user to bypass OCR)
 */
export function shouldOfferManualOverride(failureCount: number): boolean {
  return failureCount >= 3;
}
```

**Create environment config: `src/config/env.ts`**

```typescript
// Environment configuration
export const GOOGLE_CLOUD_VISION_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY || '';

// Validate required env vars
if (!GOOGLE_CLOUD_VISION_API_KEY) {
  console.warn('⚠️ Google Cloud Vision API key not set. OCR will fail.');
}
```

**Add to `.env` file:**
```bash
EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY=your-api-key-here
```

#### Step 3: Set Up Google Cloud Vision API (1 hour)

**Manual steps (not code):**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Cloud Vision API:
   - Search "Cloud Vision API"
   - Click "Enable"
4. Create API credentials:
   - Go to "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy key
5. Restrict API key (security):
   - Edit API key
   - Under "Application restrictions": Select "iOS apps"
   - Add bundle identifier: `com.touchyourbible.app`
   - Under "API restrictions": Select "Cloud Vision API"
   - Save
6. Add key to `.env` file
7. Test with sample image

**Cost**: First 1,000 OCR requests/month are FREE, then $1.50 per 1,000

#### Step 4: Add Manual Override Option (1 hour)

**For cases where OCR fails repeatedly:**

```tsx
// In VerifyModal.tsx, track OCR failures
const [ocrFailureCount, setOcrFailureCount] = useState(0);

// After OCR failure:
if (!ocrResult.success) {
  setOcrFailureCount(prev => prev + 1);

  if (shouldOfferManualOverride(ocrFailureCount)) {
    setError(
      'Having trouble with the camera? You can verify manually this time.'
    );
    // Show both camera AND manual button
  } else {
    setError(ocrResult.error);
  }
}

// Add manual verification button (only after 3 failures):
{ocrFailureCount >= 3 && !alreadyVerified && (
  <Pressable
    onPress={handleManualVerify}
    className="bg-gray-200 active:bg-gray-300 py-3 px-6 rounded-xl mb-3"
  >
    <Text className="text-gray-700 text-[15px] font-medium text-center">
      Verify Manually (Camera not working)
    </Text>
  </Pressable>
)}
```

### Testing Checklist

```
Camera Integration:
  [ ] Camera permission prompt appears on first use
  [ ] Camera view opens when tapping "Open Camera"
  [ ] Capture button takes photo
  [ ] Loading indicator shows during OCR processing
  [ ] Cancel button closes camera view
  [ ] Photo uploads successfully

OCR Validation:
  [ ] Detects text in Bible photo (ESV, NIV, NKJV)
  [ ] Rejects non-Bible photos (book cover, random text)
  [ ] Handles poor lighting gracefully (error message)
  [ ] Handles angled photos (error message)
  [ ] Handles no text detected (error message)

Success Flow:
  [ ] Successful OCR → creates verification
  [ ] Confetti triggers on success
  [ ] Modal closes after success
  [ ] Dashboard streak updates
  [ ] Points increase by 10

Error Handling:
  [ ] OCR failure shows helpful error message
  [ ] Manual override appears after 3 failures
  [ ] Network error handled gracefully
  [ ] API key missing shows fallback message
```

---

## Blocker 2: Onboarding Flow

### Current State
- ❌ No onboarding screens exist
- ✅ Auth flow works (sign-in/sign-up)
- ❌ New users land directly on Dashboard with no context

### What Needs to Create

#### Step 1: Create Onboarding Screen (2-3 hours)

**Create file: `src/screens/OnboardingScreen.tsx`**

```tsx
import React, { useState, useRef } from 'react';
import { View, ScrollView, Dimensions, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '../components/nativewindui';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';

interface OnboardingSlide {
  emoji: string;
  title: string;
  description: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    emoji: '📖',
    title: 'Build Daily Bible Reading Habits',
    description: 'Verify your Bible reading every day to build a consistent spiritual practice.',
  },
  {
    emoji: '📷',
    title: 'Verify with Your Camera',
    description: 'Take a photo of your open Bible page. Our smart verification ensures accountability.',
  },
  {
    emoji: '🏆',
    title: 'Compete with Friends',
    description: 'Climb the leaderboard, invite friends, and stay motivated together.',
  },
  {
    emoji: '🔥',
    title: 'Track Your Streak',
    description: 'Build momentum with daily streaks. Every day counts!',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    try {
      // Mark onboarding as complete
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to main app
      router.replace('/(home)');
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      // Navigate anyway
      router.replace('/(home)');
    }
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {SLIDES.map((slide, index) => (
          <View
            key={index}
            style={{ width: SCREEN_WIDTH }}
            className="flex-1 justify-center items-center px-8"
          >
            {/* Emoji */}
            <Text className="text-[80px] mb-8">{slide.emoji}</Text>

            {/* Title */}
            <Text variant="largeTitle" className="text-center mb-4 font-bold">
              {slide.title}
            </Text>

            {/* Description */}
            <Text variant="body" color="secondary" className="text-center leading-6">
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Controls */}
      <View className="px-6 pb-8">
        {/* Pagination Dots */}
        <View className="flex-row justify-center mb-6">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 ${
                index === currentIndex
                  ? 'w-8 bg-[#2196F3]'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </View>

        {/* Buttons */}
        <View className="flex-row justify-between items-center">
          {/* Skip Button */}
          {!isLastSlide && (
            <Pressable onPress={handleSkip} className="py-3 px-4">
              <Text variant="callout" className="text-gray-500">
                Skip
              </Text>
            </Pressable>
          )}

          <View className="flex-1" />

          {/* Next/Get Started Button */}
          <Button
            variant="primary"
            size="lg"
            onPress={handleNext}
            className="px-8"
          >
            <Text variant="callout" className="text-white font-semibold">
              {isLastSlide ? 'Get Started' : 'Next'}
            </Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
```

#### Step 2: Add Onboarding to Auth Flow (30 mins)

**Update `src/app/index.tsx`:**

```tsx
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../contexts/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';

export default function Index() {
  const { user, isLoading } = useAuth();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    async function checkAuthAndOnboarding() {
      if (isLoading) return;

      try {
        if (!user) {
          // Not logged in → go to sign-in
          router.replace('/(auth)/sign-in');
          return;
        }

        // Check if onboarding completed
        const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);

        if (onboardingComplete === 'true') {
          // Onboarding done → go to home
          router.replace('/(home)');
        } else {
          // First time user → show onboarding
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('Error checking onboarding:', error);
        // Default to home on error
        router.replace('/(home)');
      } finally {
        setIsCheckingOnboarding(false);
      }
    }

    checkAuthAndOnboarding();
  }, [user, isLoading]);

  // Show loading while checking
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#2196F3" />
    </View>
  );
}
```

**Create route: `src/app/onboarding.tsx`:**

```tsx
import OnboardingScreen from '../screens/OnboardingScreen';

export default OnboardingScreen;
```

#### Step 3: Add Reset Option for Testing (15 mins)

**Add to Profile screen for debugging:**

```tsx
// In ProfileScreen.tsx, add button (remove before production):
<Button
  variant="plain"
  onPress={async () => {
    await AsyncStorage.removeItem('@onboarding_complete');
    Alert.alert('Onboarding reset. Sign out and back in to see it again.');
  }}
>
  <Text>Reset Onboarding (Debug)</Text>
</Button>
```

### Testing Checklist

```
Onboarding Flow:
  [ ] Shows on first sign-up (new user)
  [ ] Does NOT show on subsequent app opens
  [ ] Skip button works (jumps to Dashboard)
  [ ] Next button advances to next slide
  [ ] "Get Started" navigates to Dashboard
  [ ] Pagination dots update correctly
  [ ] Swipe gestures work (horizontal scroll)
  [ ] Haptic feedback on button presses

Edge Cases:
  [ ] Works after sign-out and sign-in again (should not show)
  [ ] Reset button clears AsyncStorage (debug only)
  [ ] Navigation back button disabled (prevent skipping)
  [ ] Handles AsyncStorage errors gracefully
```

---

## Installation Steps

### Dependencies (already installed)
```bash
# Verify these are in package.json:
expo-camera
expo-haptics
@react-native-async-storage/async-storage
react-native-safe-area-context
```

If missing:
```bash
npx expo install expo-camera expo-haptics @react-native-async-storage/async-storage
```

### Google Cloud Vision Setup

1. Create Google Cloud project
2. Enable Cloud Vision API
3. Create API key
4. Add to `.env`:
   ```
   EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY=AIza...
   ```
5. Test with sample Bible photo

### Testing on Physical Device

```bash
# Build development client
npx expo run:ios

# OR use Expo Go (may have camera limitations)
npx expo start
# Scan QR code on iPhone
```

**Important**: Camera functionality MUST be tested on physical device (not simulator)

---

## Timeline

### Day 1 (8 hours)
- **Morning** (4 hours):
  - Set up Google Cloud Vision API (1 hour)
  - Create `src/services/ocr.ts` (2 hours)
  - Update VerifyModal camera state (1 hour)

- **Afternoon** (4 hours):
  - Integrate camera view into modal (2 hours)
  - Add photo capture handler (1 hour)
  - Test OCR with real Bible photos (1 hour)

### Day 2 (6 hours)
- **Morning** (3 hours):
  - Create OnboardingScreen component (2 hours)
  - Add to app routing (30 mins)
  - Update index.tsx logic (30 mins)

- **Afternoon** (3 hours):
  - Test onboarding flow (1 hour)
  - Test camera on physical device (1 hour)
  - Fix bugs found during testing (1 hour)

### Day 3
- **Morning** (2 hours):
  - Final QA on device
  - Fix any remaining issues
  - Prepare TestFlight build

- **Afternoon**:
  - Submit to TestFlight
  - Recruit beta testers
  - Monitor first feedback

---

## Success Criteria

### Camera Verification
- ✅ Camera opens from VerifyModal
- ✅ Photo capture works
- ✅ OCR detects Bible text (80%+ accuracy)
- ✅ Success creates verification + confetti
- ✅ Errors show helpful messages
- ✅ Manual override available after 3 failures

### Onboarding
- ✅ Shows on first app launch
- ✅ Does not show on subsequent launches
- ✅ All 4 slides display correctly
- ✅ Navigation works (next, skip, swipe)
- ✅ "Get Started" goes to Dashboard
- ✅ Pagination dots update

### Overall
- ✅ No crashes on physical device
- ✅ Camera permissions work correctly
- ✅ AsyncStorage persists onboarding state
- ✅ User can complete full flow: sign up → onboarding → verify → see confetti

---

## Risk Mitigation

### OCR Accuracy Issues
**Risk**: Google Cloud Vision fails to detect Bible text
**Mitigation**:
- Provide tips: "Hold Bible flat, ensure good lighting"
- Allow manual override after 3 failures
- Log OCR results for debugging
- Expand BIBLE_KEYWORDS list based on testing

### Camera Permissions Denied
**Risk**: User denies camera permission
**Mitigation**:
- Show clear explanation before requesting permission
- Provide deep link to Settings if denied
- Offer manual verification as alternative

### Google Cloud API Costs
**Risk**: Exceeding free tier (1,000 requests/month)
**Mitigation**:
- First 1,000 free (enough for 30+ beta testers daily)
- Cache OCR results to avoid re-processing same photo
- Set up billing alerts at $5, $10, $20

---

## Post-Implementation Checklist

```
Code Quality:
  [ ] TypeScript types for all new functions
  [ ] Error handling in try-catch blocks
  [ ] Console logs for debugging (remove before production)
  [ ] Comments explaining OCR logic
  [ ] No hardcoded strings (use constants)

Testing:
  [ ] Tested on physical iPhone (iOS 17+)
  [ ] Camera permissions tested (allow + deny scenarios)
  [ ] OCR tested with 5+ different Bible translations
  [ ] Onboarding tested (first launch + subsequent launches)
  [ ] AsyncStorage tested (reset + persist)

Security:
  [ ] API key restricted to iOS bundle ID
  [ ] API key not committed to Git (.env in .gitignore)
  [ ] OCR API rate limiting considered
  [ ] No sensitive data in logs

Performance:
  [ ] Photo compression before upload (quality: 0.7)
  [ ] OCR processing shows loading indicator
  [ ] No memory leaks (camera cleanup)
  [ ] Haptic feedback not excessive

UX:
  [ ] Error messages are user-friendly
  [ ] Loading states clear
  [ ] Success feedback delightful (confetti)
  [ ] Onboarding skippable
  [ ] Navigation flow logical
```

---

## Support Resources

### Documentation
- [Google Cloud Vision API Docs](https://cloud.google.com/vision/docs)
- [expo-camera Documentation](https://docs.expo.dev/versions/latest/sdk/camera/)
- [AsyncStorage Guide](https://react-native-async-storage.github.io/async-storage/)

### Troubleshooting
- **Camera not opening**: Check Info.plist for camera permission description
- **OCR not detecting text**: Test with sample images, check API key
- **Onboarding shows every time**: Check AsyncStorage key name, verify save logic
- **Build errors**: Run `npx expo prebuild --clean` and rebuild

---

**Implementation Owner**: Development Team
**Review Required**: Before TestFlight submission
**Priority**: P0 (blocks launch)
**Est. Completion**: 1.5 days from start
