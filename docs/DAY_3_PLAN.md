# Day 3 Implementation Plan

**Date**: October 8, 2025
**Sprint Day**: 3 of 14
**Status**: Ready to Execute
**Pre-requisites**: ✅ Day 2 Complete (dashboard + modal UI ready)

---

## 🎯 Day 3 Goals

**Primary Objective**: Add Firestore logic to verification flow

**Success Criteria**:
- ✅ Verification writes to Firestore
- ✅ Streak calculation accurate (timezone-aware)
- ✅ Confetti displays for 2 seconds after verification
- ✅ Haptic feedback triggers
- ✅ Loading state during Firestore write (<500ms)
- ✅ Error handling graceful
- ✅ "Already verified today" state works

---

## 📋 Task Breakdown (4-5 hours total)

### Task 1: Firestore Verification Service (2-3 hours)
**Owner**: Alex (Lead Engineer)
**File**: Create `src/services/verification.ts`

**Requirements**:
1. **Write Verification Document**
   ```typescript
   // Collection: users/{userId}/verifications/{date}
   interface Verification {
     date: string;          // ISO date (YYYY-MM-DD in user's timezone)
     timestamp: Timestamp;  // Server timestamp
     points: number;        // Points earned (base + streak bonus)
     streakDay: number;     // Which day of streak (1, 2, 3...)
   }
   ```

2. **Streak Calculation Logic**
   ```typescript
   async function verifyBibleReading(userId: string): Promise<VerificationResult> {
     // 1. Get user's timezone (from profile or device)
     // 2. Calculate today's date in user's timezone
     // 3. Check if already verified today
     // 4. Get last verification date
     // 5. Calculate if streak continues (yesterday = continue, gap = reset)
     // 6. Calculate points (base 10 + streak bonus)
     // 7. Write verification doc
     // 8. Update user stats (currentStreak, longestStreak, totalVerifications, points)
     // 9. Return success + new streak value
   }
   ```

3. **Timezone Handling**
   ```typescript
   // Use user's local timezone for "today" calculation
   import { format, isToday, isYesterday } from 'date-fns';
   import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
   ```

**Dependencies**:
```bash
npm install date-fns date-fns-tz
```

**Testing Checklist**:
- [ ] Hawaii user (UTC-10) verifies at 11 PM → counts as that day
- [ ] NYC user (UTC-5) verifies at 11 PM → counts as that day
- [ ] Verification at midnight edge case handled
- [ ] Streak continues if yesterday verified
- [ ] Streak resets if gap > 1 day
- [ ] Longest streak updates correctly

---

### Task 2: Integrate Verification Logic into Modal (30 min)
**Owner**: Alex (Lead Engineer)
**File**: Update `src/components/VerifyModal.tsx`

**Changes**:
```typescript
import { verifyBibleReading } from '../services/verification';
import { Confetti } from './Confetti';

export function VerifyModal({ isOpen, onClose, currentStreak, userId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newStreak, setNewStreak] = useState(0);

  const handleVerify = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyBibleReading(userId);
      setNewStreak(result.newStreak);

      // Success: Show confetti
      setShowConfetti(true);

      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Close modal after confetti (2 seconds)
      setTimeout(() => {
        onClose();
        setShowConfetti(false);
      }, 2000);

    } catch (err) {
      setError('Failed to verify. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Modal>
      {/* ... existing modal content ... */}

      {/* Loading state */}
      {isLoading && <ActivityIndicator />}

      {/* Error state */}
      {error && <Text className="text-red-500">{error}</Text>}

      {/* Confetti overlay */}
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
    </Modal>
  );
}
```

---

### Task 3: Confetti Integration (30 min)
**Owner**: Alex (Lead Engineer)
**Status**: ✅ Component already built (Day 2)

**Integration Steps**:
1. Import Confetti component
2. Add state: `const [showConfetti, setShowConfetti] = useState(false);`
3. Trigger after successful verification: `setShowConfetti(true);`
4. Auto-hide after 2 seconds
5. Close modal after confetti completes

**Test**:
- Confetti displays full-screen
- 200 particles animate smoothly
- 2-second duration feels right
- Modal closes automatically after confetti

---

### Task 4: Haptic Feedback (15 min)
**Owner**: Alex (Lead Engineer)
**Package**: `expo-haptics` (already installed)

**Implementation**:
```typescript
import * as Haptics from 'expo-haptics';

// Button tap (light feedback)
<Pressable onPress={() => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  handleVerify();
}}>

// Success (notification feedback)
await verifyBibleReading(userId);
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

**Test**:
- Tap button → subtle vibration
- Success → celebratory pattern
- Works on physical device (simulator doesn't support haptics)

---

### Task 5: Loading & Error States (1 hour)
**Owner**: Alex (Lead Engineer)

**Loading State**:
```typescript
<Button disabled={isLoading}>
  {isLoading ? (
    <ActivityIndicator color="white" />
  ) : (
    <Button.Text>✅ Yes, I Read Today</Button.Text>
  )}
</Button>
```

**Error State**:
```typescript
{error && (
  <View className="bg-red-50 p-3 rounded-lg mt-2">
    <Text className="text-red-600 text-sm text-center">
      {error}
    </Text>
    <Pressable onPress={handleVerify} className="mt-2">
      <Text className="text-red-600 font-semibold text-center">
        Try Again
      </Text>
    </Pressable>
  </View>
)}
```

**Test**:
- Network error → Show error message + retry button
- Firestore offline → Graceful error
- Loading spinner shows during write
- Button disabled during loading

---

### Task 6: "Already Verified" State (30 min)
**Owner**: Alex (Lead Engineer)

**Check on Modal Open**:
```typescript
useEffect(() => {
  if (isOpen) {
    checkIfVerifiedToday(userId).then((verified) => {
      setAlreadyVerified(verified);
    });
  }
}, [isOpen, userId]);
```

**UI State**:
```typescript
{alreadyVerified ? (
  <>
    <Text className="text-green-500 text-lg font-semibold text-center">
      ✅ Already verified today!
    </Text>
    <Text className="text-gray-600 text-center mt-2">
      Come back tomorrow to continue your streak
    </Text>
  </>
) : (
  // Show normal verify buttons
)}
```

---

## 🛠️ Technical Dependencies

### NPM Packages (Install First)
```bash
npm install date-fns date-fns-tz
```

### Existing Packages (Already Installed)
- ✅ firebase/firestore (Firestore SDK)
- ✅ expo-haptics (Haptic feedback)
- ✅ react-native-reanimated (Confetti animation)

---

## 📊 Testing Checklist (Jordan + Taylor)

### Functional Testing
- [ ] Tap "Verify" → Modal opens
- [ ] Tap "Yes, I Read Today" → Loading spinner shows
- [ ] Firestore write succeeds → Confetti displays
- [ ] Confetti plays for 2 seconds
- [ ] Haptic feedback triggers (on device)
- [ ] Modal closes automatically after confetti
- [ ] Dashboard streak updates to new value
- [ ] Tap "Not Yet" → Modal closes (no verification)

### Edge Cases
- [ ] Verify twice in same day → Shows "Already verified"
- [ ] Network error → Error message + retry button
- [ ] Firestore offline → Graceful error handling
- [ ] Streak continues correctly (verify yesterday, verify today)
- [ ] Streak resets correctly (gap > 1 day)
- [ ] Timezone edge case (11:59 PM verification)

### UX Validation
- [ ] Interaction feels < 2 seconds (tap → celebration)
- [ ] Confetti not annoying (2-second duration correct)
- [ ] Haptic feels celebratory (not jarring)
- [ ] Error messages clear and actionable
- [ ] Loading state doesn't block UI

---

## 🚨 Known Risks & Mitigations

### Risk 1: Timezone Calculation Complexity
**Impact**: User in Hawaii verifies at 11 PM → might count as next day
**Mitigation**:
- Use user's device timezone (not server time)
- Test with multiple timezones
- Marcus to review timezone logic

### Risk 2: Firestore Write Latency
**Impact**: Verification feels slow (>500ms)
**Mitigation**:
- Optimistic UI (show confetti immediately)
- Background write
- Rollback on error

### Risk 3: Confetti Performance on Low-End Devices
**Impact**: Animation drops frames
**Mitigation**:
- Test on oldest supported device
- Reduce particle count if needed (200 → 150)
- Already using react-native-reanimated (UI thread)

---

## 📅 Day 3 Schedule (Estimated)

| Time Block | Task | Owner | Duration |
|------------|------|-------|----------|
| **9:00-9:15 AM** | Install date-fns packages | Alex | 15 min |
| **9:15-11:45 AM** | Build verification service | Alex | 2.5 hours |
| **11:45-12:00 PM** | Marcus reviews timezone logic | Marcus | 15 min |
| **12:00-1:00 PM** | Lunch break | All | 1 hour |
| **1:00-1:30 PM** | Integrate into modal | Alex | 30 min |
| **1:30-2:00 PM** | Add confetti trigger | Alex | 30 min |
| **2:00-2:15 PM** | Add haptic feedback | Alex | 15 min |
| **2:15-3:15 PM** | Loading/error states | Alex | 1 hour |
| **3:15-3:45 PM** | "Already verified" state | Alex | 30 min |
| **3:45-4:30 PM** | Testing + bug fixes | Alex, Jordan | 45 min |
| **4:30-5:00 PM** | Demo + team review | All | 30 min |

**Total**: ~5 hours (within estimate)

---

## ✅ Day 3 Success Criteria

**Demo Ready (5:00 PM)**:
1. ✅ Verification writes to Firestore correctly
2. ✅ Streak calculation accurate (tested with Hawaii/NYC timezones)
3. ✅ Confetti displays for 2 seconds, feels celebratory
4. ✅ Haptic feedback triggers on device
5. ✅ Loading state shows (spinner during write)
6. ✅ Error handling graceful (network error → retry button)
7. ✅ "Already verified" state prevents duplicate verifications
8. ✅ Dashboard updates with new streak value
9. ✅ Zero crashes or console errors
10. ✅ Interaction feels < 2 seconds (Jordan's UX metric)

---

## 🎯 Handoff to Day 4

**Day 4 Prerequisites** (must be done Day 3):
- [x] Verification service complete and tested
- [x] Modal integrated with real backend logic
- [x] Confetti working on device
- [x] All edge cases handled (already verified, errors, timezone)

**Day 4 Will Build**:
- Global leaderboard backend (React Query + Firestore listeners)
- Leaderboard UI (NativeWind list components)
- Real-time updates (onSnapshot subscriptions)
- User rank display

---

## 📝 Notes for Team

**Alex (Engineer)**:
- Start with verification service (core logic)
- Marcus available for timezone review mid-day
- Test on device for haptics (simulator won't work)
- Keep confetti physics as-is unless Jordan reports issues

**Marcus (Architect)**:
- Review timezone logic around 11:45 AM
- Validate Firestore indexes deployed (console check)
- Monitor write performance (<100ms target for write, <500ms total with animation)

**Jordan (UX)**:
- Join 3:45 PM testing session
- Stopwatch test: tap → celebration (<2 seconds)
- Validate error messages are clear
- Confirm haptic feels celebratory (not jarring)

**Taylor (Design)**:
- Join 4:30 PM demo
- Validate confetti timing (2 seconds correct?)
- Check loading spinner placement
- Approve final visual polish

---

**Status**: 📋 Ready to Execute
**Next Update**: EOD Day 3 (October 8, 2025 @ 5:00 PM PST)
**Confidence**: 88% for on-time Day 3 delivery

**Last Updated**: October 8, 2025 @ 12:00 AM PST
