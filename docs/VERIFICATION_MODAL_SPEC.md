# Verification Modal - Design Specification

**Owner**: Taylor (Visual Designer), Jordan (UX Designer)
**Developer**: Alex (Lead Engineer)
**Due**: End of Day 3 (October 10, 2025)
**Priority**: P0 (Critical Path)

---

## Overview

The verification modal is THE brand moment for Touch Your Bible. This interaction must feel:
- ✨ **Delightful** - Positive reinforcement, celebration
- ⚡ **Instant** - No friction, immediate feedback
- 🎯 **Focused** - Single purpose, clear CTA
- 🎨 **Polished** - Production-quality design from Day 1

---

## User Flow

```
Dashboard → Tap "Verify Today" → Modal Opens → Tap "I Read Today" → Confetti 🎉 → Updated Streak → Modal Closes
```

**Interaction Time**: <2 seconds from tap to celebration

---

## Modal Layout (NativeWind UI)

### Structure

```
┌─────────────────────────────────────┐
│                                     │
│              [Icon]                 │ <- Bible icon or streak flame
│                                     │
│        Did you read your            │ <- Headline (22px, semibold)
│          Bible today?               │
│                                     │
│    ┌─────────────────────────┐    │
│    │   ✅ Yes, I Read Today   │    │ <- Primary button (P0)
│    └─────────────────────────┘    │
│                                     │
│    ┌─────────────────────────┐    │
│    │      Not Yet             │    │ <- Secondary button (P1)
│    └─────────────────────────┘    │
│                                     │
│  Current Streak: 4 days 🔥          │ <- Motivational context
│                                     │
└─────────────────────────────────────┘
```

---

## NativeWind UI Components

### Modal Container
**Component**: `<Sheet>` (NativeWind UI modal/bottom sheet)

```tsx
<Sheet>
  <Sheet.Content className="p-6 bg-white dark:bg-dark-surface">
    {/* Modal content */}
  </Sheet.Content>
</Sheet>
```

**Specs**:
- Presentation: Modal (centered) or Bottom Sheet (iOS style)
- Background: White with blur backdrop
- Border radius: `rounded-2xl` (24px)
- Padding: `p-6` (24px all sides)
- Shadow: `shadow-modal` (defined in DESIGN_SYSTEM.md)

---

### Primary Button (NativeWind UI)
**Component**: `<Button>` variant="default"

```tsx
<Button
  variant="default"
  size="lg"
  className="bg-primary-500 active:bg-primary-600"
  onPress={handleVerify}
>
  <Button.Text>✅ Yes, I Read Today</Button.Text>
</Button>
```

**Specs**:
- Background: `bg-primary-500` (#2196F3 - iOS Blue)
- Active state: `active:bg-primary-600` (darker blue)
- Text: White, 17px (body), semibold
- Padding: `py-4 px-6` (16px vertical, 24px horizontal)
- Border radius: `rounded-lg` (12px)
- Min height: 44px (iOS touch target)
- Width: Full width (`w-full`)

**Interaction**:
- Tap: Scale down to 95% (`active:scale-95`)
- Haptic: Success pattern (medium impact)
- Duration: 150ms transition

---

### Secondary Button (NativeWind UI)
**Component**: `<Button>` variant="ghost"

```tsx
<Button
  variant="ghost"
  size="lg"
  className="bg-gray-100 active:bg-gray-200"
  onPress={handleDismiss}
>
  <Button.Text className="text-gray-700">Not Yet</Button.Text>
</Button>
```

**Specs**:
- Background: `bg-gray-100` (light gray)
- Active state: `active:bg-gray-200`
- Text: `text-gray-700`, 17px, regular weight
- Same padding/sizing as primary button
- Border radius: `rounded-lg` (12px)

---

### Icon (Top)
**Options**:
1. **Bible Icon**: `@roninoss/icons` - `book` or `book-open`
2. **Flame Icon**: For streak emphasis (from @expo/vector-icons)
3. **Custom SVG**: Stylized Bible or reading icon

**Specs**:
- Size: 64px × 64px
- Color: `text-primary-500` (blue) or `text-accent-500` (gold)
- Margin bottom: `mb-4` (16px)
- Center aligned

---

### Headline Text

```tsx
<Text className="text-[22px] font-semibold text-gray-900 dark:text-dark-text-primary text-center mb-2">
  Did you read your Bible today?
</Text>
```

**Specs**:
- Font size: 22px (title2 from iOS typography scale)
- Weight: Semibold (600)
- Color: `text-gray-900` / dark mode: `text-dark-text-primary`
- Line height: 28px (`leading-[28px]`)
- Alignment: Center
- Margin bottom: `mb-2` (8px)

---

### Streak Context Text

```tsx
<Text className="text-[15px] text-gray-500 dark:text-dark-text-tertiary text-center mt-4">
  Current Streak: {currentStreak} days 🔥
</Text>
```

**Specs**:
- Font size: 15px (subheadline)
- Weight: Regular (400)
- Color: `text-gray-500` (secondary text)
- Alignment: Center
- Margin top: `mb-4` (16px from buttons)

---

## Animation Specifications

### 1. Modal Entry Animation

```tsx
<Sheet
  entering={SlideInDown.duration(350).easing(Easing.bezier(0.25, 0.1, 0.25, 1))}
  exiting={SlideOutDown.duration(250)}
>
```

**Specs**:
- Entry: Slide in from bottom (350ms)
- Easing: iOS spring curve
- Backdrop: Fade in (250ms) with blur

---

### 2. Confetti Animation (react-native-reanimated)

**Trigger**: After "Yes, I Read Today" button tap

**Library**: `react-native-confetti-cannon` or custom with `react-native-reanimated`

**Specs**:
- Duration: 2000ms (2 seconds)
- Particle count: 150-200
- Colors: `[#2196F3, #FFC107, #4CAF50, #9C27B0]` (primary, accent, success, secondary)
- Origin: Center of screen
- Spread: 360° radial
- Gravity: Moderate (particles fall naturally)

**Implementation**:
```tsx
import ConfettiCannon from 'react-native-confetti-cannon';

<ConfettiCannon
  count={200}
  origin={{ x: width / 2, y: height / 2 }}
  autoStart={true}
  fadeOut={true}
/>
```

---

### 3. Streak Counter Animation

**When**: Streak increments after verification

**Animation**: Scale + fade
```tsx
<Animated.View entering={ZoomIn.duration(500).springify()}>
  <Text>{newStreak} days 🔥</Text>
</Animated.View>
```

**Specs**:
- Scale: 1.0 → 1.2 → 1.0 (spring bounce)
- Duration: 500ms
- Easing: Spring (natural physics)

---

### 4. Haptic Feedback

**Success Pattern** (when verified):
```tsx
import * as Haptics from 'expo-haptics';

Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

**Light Pattern** (button tap):
```tsx
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

---

## States & Edge Cases

### Loading State (Firestore Write)

```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <ActivityIndicator color="white" />
  ) : (
    <Button.Text>✅ Yes, I Read Today</Button.Text>
  )}
</Button>
```

**Duration**: <500ms (optimistic UI preferred)

---

### Error State

**If verification fails** (network error, Firestore write fails):

```tsx
<Text className="text-red-500 text-sm text-center mt-2">
  ⚠️ Something went wrong. Please try again.
</Text>
```

**Retry**: Button becomes "Try Again"

---

### Already Verified Today

**If user already verified today**:

```tsx
<Text className="text-green-500 text-lg font-semibold text-center">
  ✅ Already verified today!
</Text>
<Text className="text-gray-600 text-center mt-2">
  Come back tomorrow to continue your streak
</Text>
```

**Button**: Disabled or hidden

---

## Color System (from DESIGN_SYSTEM.md)

### Primary Colors
```tsx
primary-500: '#2196F3'  // iOS Blue (buttons, CTA)
primary-600: '#1E88E5'  // Active/pressed state
```

### Accent Colors
```tsx
accent-500: '#FFC107'   // Achievement Gold (confetti)
success: '#4CAF50'      // Green (success messages)
error: '#F44336'        // Red (error states)
```

### Neutral Colors
```tsx
gray-100: '#F5F5F5'     // Secondary button background
gray-500: '#9E9E9E'     // Secondary text
gray-900: '#212121'     // Primary text
```

---

## Accessibility (WCAG 2.1 AA)

### VoiceOver Labels

```tsx
<Button accessibilityLabel="Verify Bible reading for today">
  <Button.Text>✅ Yes, I Read Today</Button.Text>
</Button>
```

**Labels**:
- Primary button: "Verify Bible reading for today"
- Secondary button: "Dismiss verification modal"
- Modal: "Daily verification dialog"

### Color Contrast
- **Primary button**: White text on #2196F3 = 4.6:1 ✅
- **Secondary button**: #616161 on #F5F5F5 = 4.8:1 ✅
- **Headline**: #212121 on white = 16.1:1 ✅

### Dynamic Type Support
- Support iOS text size adjustments
- Minimum button height: 44px (maintained at all text sizes)

---

## Implementation Checklist

### Day 2 (UI Only)
- [ ] Create `VerifyModal.tsx` component
- [ ] Implement NativeWind UI Sheet/Modal
- [ ] Design primary/secondary buttons (NativeWind Button)
- [ ] Add icon (book or flame)
- [ ] Style headline and streak text
- [ ] Test modal open/close animation

### Day 3 (Logic + Animation)
- [ ] Wire to Firestore (verify action)
- [ ] Implement streak calculation
- [ ] Add confetti animation (react-native-confetti-cannon)
- [ ] Add haptic feedback
- [ ] Implement loading state
- [ ] Handle error state
- [ ] Handle "already verified" state
- [ ] Add VoiceOver labels
- [ ] Test on device (iOS)

---

## Example Code Structure

```tsx
// src/components/VerifyModal.tsx
import { Sheet } from 'nativewindui'; // or equivalent NativeWind modal
import { Button } from 'nativewindui';
import { Icon } from '@roninoss/icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';

export function VerifyModal({ isOpen, onClose, currentStreak }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleVerify = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await verifyBibleReading(); // Firestore write

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowConfetti(true);

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      // Show error state
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <Sheet.Content className="p-6 bg-white rounded-2xl">
        {/* Icon */}
        <View className="items-center mb-4">
          <Icon name="book-open" size={64} color="#2196F3" />
        </View>

        {/* Headline */}
        <Text className="text-[22px] font-semibold text-gray-900 text-center mb-6">
          Did you read your Bible today?
        </Text>

        {/* Primary Button */}
        <Button
          variant="default"
          size="lg"
          className="bg-primary-500 mb-3"
          onPress={handleVerify}
          disabled={isLoading}
        >
          <Button.Text>✅ Yes, I Read Today</Button.Text>
        </Button>

        {/* Secondary Button */}
        <Button
          variant="ghost"
          size="lg"
          className="bg-gray-100"
          onPress={onClose}
        >
          <Button.Text className="text-gray-700">Not Yet</Button.Text>
        </Button>

        {/* Streak Context */}
        <Text className="text-[15px] text-gray-500 text-center mt-4">
          Current Streak: {currentStreak} days 🔥
        </Text>

        {/* Confetti */}
        {showConfetti && (
          <ConfettiCannon
            count={200}
            origin={{ x: width / 2, y: height / 2 }}
            autoStart
            fadeOut
          />
        )}
      </Sheet.Content>
    </Sheet>
  );
}
```

---

## Success Criteria

**Day 3 Demo**:
1. ✅ Modal opens smoothly from dashboard
2. ✅ Buttons are touch-responsive (44px minimum)
3. ✅ Confetti plays on verification
4. ✅ Haptic feedback triggers
5. ✅ Streak increments visibly
6. ✅ Loading state shows during write
7. ✅ Error state handles gracefully
8. ✅ VoiceOver reads all elements correctly

**User Testing**:
- "This feels delightful" (subjective but measurable via feedback)
- <2 seconds from tap to celebration
- Zero confusion about what to do

---

**Status**: 📝 Specification Complete
**Next**: Day 2 - Alex implements UI structure
**Collaboration**: Jordan reviews UX flow, Taylor validates design tokens

**Last Updated**: October 7, 2025
