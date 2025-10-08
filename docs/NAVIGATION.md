# Touch Your Bible - Navigation Architecture

**Date**: October 7, 2025
**Owner**: Priya (Information Architect)

---

## 🗺️ App Structure

### Navigation Pattern
- **Primary**: Tab Navigation (Home, Leaderboard, Profile)
- **Secondary**: Stack Navigation (within each tab)
- **Routing**: Expo Router (file-based)

---

## 📱 Screen Hierarchy

```
App
├── (auth) - Stack Navigator
│   ├── index.tsx              → Landing/redirect
│   ├── sign-in.tsx            → Sign In Screen
│   ├── sign-up.tsx            → Sign Up Screen
│   └── reset-password.tsx     → Password Reset
│
└── (home) - Tab Navigator (authenticated)
    ├── index.tsx              → Home/Dashboard Tab
    │   ├── dashboard          → Daily verification, streak display
    │   └── verify             → Verification flow (modal)
    │
    ├── leaderboard.tsx        → Leaderboard Tab
    │   ├── global             → Global leaderboard (default)
    │   └── friends            → Friends leaderboard
    │
    └── profile.tsx            → Profile Tab
        ├── stats              → Personal stats
        ├── invite             → Invite friends (modal)
        └── settings           → App settings
```

---

## 🎯 User Flows

### 1. First-Time User Flow
```
Landing → Sign Up → Onboarding (3 screens) → Home Dashboard → Verify Bible → Leaderboard
```

**Onboarding Screens**:
1. **Welcome**: "Build your daily Bible habit"
2. **How It Works**: "Verify daily → Build streaks → Compete with friends"
3. **Invite Friends**: "Invite friends to join your journey"

### 2. Returning User Flow
```
Landing → Sign In → Home Dashboard
```

### 3. Daily Verification Flow
```
Home → Tap "Verify Today" → Confirmation Modal → Success (confetti) → Updated Dashboard
```

### 4. Friend Invite Flow
```
Profile → Invite Friends → Share Code (iOS Share Sheet) → Friend Signs Up → Both Get Bonus
```

### 5. Leaderboard Flow
```
Leaderboard Tab → Global (default) → Switch to Friends → Tap User → View Profile (future)
```

---

## 📂 Expo Router File Structure

### Current Structure (Needs Updates)
```
src/app/
├── (auth)/
│   ├── _layout.tsx          ✅ Exists
│   ├── index.tsx            ✅ Exists
│   ├── sign-in.tsx          ✅ Exists
│   ├── sign-up.tsx          ✅ Exists
│   └── reset-password.tsx   ✅ Exists
│
├── (home)/
│   ├── _layout.tsx          ⚠️ Needs tab navigation
│   ├── index.tsx            ✅ Exists (dashboard)
│   ├── camera.tsx           ⚠️ Rename to verify.tsx (modal)
│   └── app-usage-test.tsx   ❌ Remove (unused)
│
├── _layout.tsx              ✅ Exists
└── index.tsx                ✅ Exists
```

### Required Changes
```
src/app/(home)/
├── _layout.tsx              → Add Tabs component
├── index.tsx                → Home/Dashboard (keep)
├── leaderboard.tsx          → NEW (Leaderboard tab)
├── profile.tsx              → NEW (Profile tab)
└── verify.tsx               → RENAME from camera.tsx (modal)

DELETE:
└── app-usage-test.tsx       → Remove (unused)
```

---

## 🎨 Tab Configuration

### Bottom Tab Bar (iOS Style)
```typescript
// src/app/(home)/_layout.tsx
import { Tabs } from 'expo-router';
import { HomeIcon, TrophyIcon, UserIcon } from '@/components/icons';

export default function HomeLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb', // Primary blue
        tabBarInactiveTintColor: '#9ca3af', // Gray
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color }) => <TrophyIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
```

---

## 🔒 Navigation Guards

### Protected Routes
All routes under `(home)` require authentication:
```typescript
// src/app/(home)/_layout.tsx
import { ProtectedRoute } from '@/contexts/auth';

export default function HomeLayout() {
  return (
    <ProtectedRoute fallback={<Redirect href="/(auth)/sign-in" />}>
      <Tabs>{/* ... */}</Tabs>
    </ProtectedRoute>
  );
}
```

### Public Routes
Routes under `(auth)` are public (sign in, sign up, reset password)

---

## 🎯 Screen Responsibilities

### Home (Dashboard) - `(home)/index.tsx`
**Purpose**: Daily verification hub, streak display, quick stats

**Components**:
- Daily verification button (primary CTA)
- Streak display (current streak, longest streak)
- Quick stats card (total days, rank preview)
- Recent activity feed (future)

**Actions**:
- Tap "Verify Today" → Open verify modal
- View streak → Navigate to stats (future)

### Leaderboard - `(home)/leaderboard.tsx`
**Purpose**: Global and friends leaderboards

**Components**:
- Segmented control (Global / Friends)
- Leaderboard list (top 100)
- Current user rank badge
- Search/filter (future)

**Actions**:
- Switch between Global/Friends tabs
- Scroll leaderboard (infinite scroll future)
- Tap user → View profile (future)

### Profile - `(home)/profile.tsx`
**Purpose**: User settings, stats, invite friends

**Components**:
- User info card (name, email, invite code)
- Stats summary (total days, streak, rank)
- Invite friends button
- Settings (future: theme, notifications, privacy)
- Sign out button

**Actions**:
- Tap "Invite Friends" → Open invite modal
- Tap invite code → Copy to clipboard
- Tap settings → Navigate to settings (future)

### Verify Modal - `(home)/verify.tsx`
**Purpose**: Bible verification confirmation (honor system)

**Components**:
- Confirmation message: "Did you read your Bible today?"
- Primary button: "Yes, I read today"
- Secondary button: "Not yet"
- Celebration animation (confetti on success)

**Actions**:
- Tap "Yes" → Update streak, close modal, show confetti
- Tap "Not yet" → Close modal, no change

---

## 📊 Information Architecture Principles

### Cognitive Load Reduction
- **≤3 taps** to any feature
- **Primary actions** visible without scrolling
- **Clear hierarchy**: Home → Leaderboard → Profile

### Logical Grouping
- **Home**: Personal progress + verification
- **Leaderboard**: Competition + social
- **Profile**: Settings + invites

### Progressive Disclosure
- **MVP**: Core features only (verify, leaderboard, invite)
- **v2**: Advanced features (groups, achievements, settings)

### Empty States
- **No friends**: "Invite friends to see their progress"
- **No streak**: "Start your first streak today!"
- **New user**: "Welcome! Verify your first day"

---

## 🚀 Navigation Implementation Plan

### Day 1 (Today)
- ✅ Document navigation structure (this file)
- ⏳ Create new screens (leaderboard.tsx, profile.tsx)
- ⏳ Update `(home)/_layout.tsx` with Tabs
- ⏳ Rename camera.tsx → verify.tsx
- ⏳ Remove app-usage-test.tsx

### Day 2
- Wire up navigation guards (ProtectedRoute)
- Implement tab icons (NativeWind UI or custom)
- Test navigation flows (sign in → tabs → verify)

### Day 3
- Add modal presentation for verify screen
- Test deep linking (future)
- Validate user flows with Jordan (UX)

---

## ✅ Navigation Checklist

### File Structure
- [ ] Create `leaderboard.tsx`
- [ ] Create `profile.tsx`
- [ ] Rename `camera.tsx` → `verify.tsx`
- [ ] Delete `app-usage-test.tsx`
- [ ] Update `(home)/_layout.tsx` with Tabs

### Functionality
- [ ] Tab navigation working (Home, Leaderboard, Profile)
- [ ] Protected routes enforcing auth
- [ ] Modal presentation for verify screen
- [ ] Tab bar icons + labels
- [ ] Active tab highlighting

### User Experience
- [ ] ≤3 taps to any feature
- [ ] Clear visual hierarchy
- [ ] Empty states handled
- [ ] Loading states handled
- [ ] Back navigation working

---

**Navigation structure complete. Ready for implementation.**
