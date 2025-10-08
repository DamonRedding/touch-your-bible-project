# Day 2 Implementation Roadmap

**Date**: October 8, 2025
**Sprint Day**: 2 of 14
**Status**: Ready to Execute

---

## 🎯 Day 2 Goals

**Primary Objective**: Dashboard rebuild + Verification modal UI (no backend logic yet)

**Success Criteria**:
- ✅ Dashboard shows verification CTA prominently
- ✅ Verification modal opens/closes smoothly
- ✅ All UI components use NativeWind UI
- ✅ Design matches [VERIFICATION_MODAL_SPEC.md](VERIFICATION_MODAL_SPEC.md)
- ✅ No TypeScript errors
- ✅ Runs on iOS simulator

---

## 📋 Task Breakdown

### Task 1: Dashboard Screen Rebuild (2-3 hours)
**Owner**: Alex (Engineer)
**File**: [src/screens/DashboardScreen.tsx](../src/screens/DashboardScreen.tsx)

**Current State** (needs replacement):
```tsx
// Minimal welcome screen with sign out button
// File: src/screens/DashboardScreen.tsx (53 lines)
```

**Target State**:
```
┌─────────────────────────────────┐
│  Good morning! 👋               │ <- Greeting (personalized)
│                                 │
│  ┌───────────────────────────┐ │
│  │  Current Streak: 4 days   │ │ <- Streak card (large)
│  │         🔥🔥🔥🔥            │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ ✅ Verify Bible Reading   │ │ <- Primary CTA (opens modal)
│  │    (Large Button)          │ │
│  └───────────────────────────┘ │
│                                 │
│  Quick Stats:                   │
│  • Total Days: 12               │ <- Stats row (compact)
│  • Points: 22                   │
│  • Global Rank: #453            │
│                                 │
└─────────────────────────────────┘
```

**Components to Create**:
1. `StreakCard` - Shows current streak with flame icons
2. `VerifyButton` - Primary CTA (NativeWind Button)
3. `QuickStatsRow` - Compact stats display

**Stub Data** (for Day 2 only):
```tsx
const stubUser = {
  currentStreak: 0,
  longestStreak: 0,
  totalVerifications: 0,
  points: 0,
  rank: null
};
```

**Actions**:
- [ ] Import NativeWind UI components (Button, Card)
- [ ] Create StreakCard component
- [ ] Create VerifyButton (opens modal)
- [ ] Create QuickStatsRow component
- [ ] Wire modal open/close state
- [ ] Test on iOS simulator

---

### Task 2: Verification Modal Component (3-4 hours)
**Owner**: Alex (Engineer) + Taylor (Design Review)
**New File**: `src/components/VerifyModal.tsx`

**Spec**: Follow [VERIFICATION_MODAL_SPEC.md](VERIFICATION_MODAL_SPEC.md) exactly

**Component Structure**:
```tsx
// src/components/VerifyModal.tsx

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  onVerify?: () => void; // Stub for Day 2
}

export function VerifyModal({ isOpen, onClose, currentStreak }: VerifyModalProps) {
  // UI only (no backend logic Day 2)
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      {/* Modal content per spec */}
    </Sheet>
  );
}
```

**Dependencies**:
```bash
# Check if these are installed (likely already present)
npm list react-native-reanimated
npm list expo-haptics

# If react-native-confetti-cannon not installed:
npm install react-native-confetti-cannon
```

**Components from Spec**:
1. Sheet/Modal container (NativeWind UI)
2. Icon (book or flame) - @roninoss/icons
3. Headline text
4. Primary button ("Yes, I Read Today")
5. Secondary button ("Not Yet")
6. Streak context text

**Actions Day 2** (UI only):
- [ ] Create VerifyModal.tsx
- [ ] Import NativeWind Sheet/Modal component
- [ ] Add icon from @roninoss/icons (book-open or book)
- [ ] Style headline text (22px, semibold, centered)
- [ ] Create primary button (NativeWind Button, blue)
- [ ] Create secondary button (NativeWind Button, gray)
- [ ] Add streak context text
- [ ] Test modal open/close animation
- [ ] Verify design matches spec (Taylor review)

**Defer to Day 3** (logic):
- Firestore write on verify
- Confetti animation
- Haptic feedback
- Loading/error states
- Actual streak increment

---

### Task 3: NativeWind UI Integration (1-2 hours)
**Owner**: Taylor (Visual Designer)

**Objective**: Ensure we're using NativeWind UI components correctly

**Check**:
- [ ] Verify NativeWind UI is in package.json
- [ ] Import Button, Sheet/Modal, Card from correct package
- [ ] Validate color tokens match DESIGN_SYSTEM.md
- [ ] Test dark mode compatibility (even though MVP is light mode)

**If NativeWind UI not installed**:
```bash
# Install NativeWind UI (if needed)
npm install nativewindui
```

**Color Tokens to Use**:
```tsx
// Primary button
className="bg-primary-500 active:bg-primary-600"

// Secondary button
className="bg-gray-100 active:bg-gray-200 text-gray-700"

// Streak card
className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow-card"
```

**Actions**:
- [ ] Document which NativeWind UI components we're using
- [ ] Create color token mapping guide
- [ ] Review Alex's implementation for design fidelity
- [ ] Provide feedback on spacing/typography

---

### Task 4: Jordan UX Review (30 min - 1 hour)
**Owner**: Jordan (UX Designer)

**Review Checklist**:
- [ ] Dashboard CTA is prominent (no scrolling needed)
- [ ] Modal opens with smooth animation
- [ ] Button touch targets ≥44px
- [ ] Text hierarchy is clear
- [ ] Empty state messaging (if streak = 0)
- [ ] "Not Yet" button doesn't feel punitive

**Feedback Format**:
- Quick sync with Alex mid-day
- Async feedback via comments in code review

---

## 🛠️ Technical Setup

### Environment Check
```bash
# Verify development environment
npm run type-check
npm run lint

# Start Expo dev server
npm start
```

### Testing on iOS Simulator
```bash
# Open iOS simulator
npm run ios

# Or use Expo Go app on physical device
```

---

## 📦 Dependencies Audit

**Confirm Installed**:
```bash
npm list nativewindui
npm list @roninoss/icons
npm list react-native-reanimated
npm list expo-haptics
```

**If Missing, Install**:
```bash
npm install nativewindui react-native-confetti-cannon
```

---

## ⚠️ Known Blockers/Risks

### Blocker 1: NativeWind UI Documentation
**Risk**: NativeWind UI may not have Sheet/Modal component
**Mitigation**:
- Fallback to `react-native-modal` or Expo `Modal`
- Or use bottom sheet: `@gorhom/bottom-sheet`

**Action**: Taylor to research NativeWind UI components available

---

### Blocker 2: Design Tokens Not in Tailwind Config
**Risk**: Color classes like `bg-primary-500` may not exist
**Mitigation**: Check `tailwind.config.js`, add custom colors if needed

**Action**: Alex to validate tailwind config matches DESIGN_SYSTEM.md

---

## 📊 Success Metrics (EOD Day 2)

**Demo Ready**:
1. ✅ Dashboard loads with stub data
2. ✅ Tap "Verify" button → Modal opens
3. ✅ Modal shows proper layout (per spec)
4. ✅ Tap "Yes, I Read Today" → Console log (no backend yet)
5. ✅ Tap "Not Yet" → Modal closes
6. ✅ No TypeScript errors
7. ✅ Runs on iOS simulator

**Design Review** (Taylor):
- Layout matches specification
- Colors match DESIGN_SYSTEM.md
- Typography correct (sizes, weights)
- Spacing consistent with design system

**UX Review** (Jordan):
- CTA is obvious ("What do I do?")
- Modal interaction feels natural
- No confusion about button purpose

---

## 🚦 EOD Check-In (Day 2)

**At 5:00 PM PST**:
1. Alex demos dashboard + modal on Slack/video
2. Taylor provides design feedback (< 30 min turnaround)
3. Jordan confirms UX flow
4. Team confirms ready for Day 3 (backend logic)

**If Behind Schedule**:
- Defer QuickStatsRow to Day 3
- Focus on: Dashboard CTA + Modal layout only

**If Ahead of Schedule**:
- Start confetti animation setup (Day 3 task)
- Begin Firestore integration research

---

## 📝 Handoff to Day 3

**Day 3 Prerequisites** (must be done Day 2):
- [x] VerifyModal component exists and renders
- [x] Modal can open/close via state
- [x] Button structure in place (ready to wire backend)

**Day 3 Will Add**:
- Firestore write logic (verify action)
- Confetti animation
- Haptic feedback
- Streak calculation
- Loading/error states

---

## 🎯 Daily Standup Notes (for team)

**What I'll do today** (Day 2):
- Alex: Rebuild dashboard + create verification modal UI
- Taylor: Design review + NativeWind component guidance
- Jordan: UX flow review

**Blockers**:
- None currently

**Help Needed**:
- Taylor: Confirm NativeWind UI components available (Sheet/Modal)

---

**Status**: 📋 Ready to Execute
**Next Update**: EOD Day 2 (October 8, 2025 @ 5:00 PM PST)

**Last Updated**: October 7, 2025 @ 17:30 PST
