# Quick Start Guide - Touch Your Bible
**iOS MVP - Post-P0 Implementation**

---

## 🚀 Running the App

### Start Development Server
```bash
npm start
```

### Run on iOS Simulator
```bash
npm run ios
```

### Run on Physical Device
1. Scan QR code with Camera app (iOS)
2. Opens in Expo Go

---

## 🧪 Testing

### Run Unit Tests
```bash
npm test

# Watch mode (auto-rerun on changes)
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Run E2E Tests (Maestro)
```bash
# Install Maestro (first time only)
curl -Ls "https://get.maestro.mobile.dev" | bash

# Run all flows
maestro test maestro/flows/01_onboarding.yaml
maestro test maestro/flows/02_verification.yaml
maestro test maestro/flows/03_tab_navigation.yaml
```

### Manual Testing Checklist
See [MULTI_PERSONA_UX_ANALYSIS.md](MULTI_PERSONA_UX_ANALYSIS.md) → Phase 4

---

## 🎯 Key Features to Test

### ✅ Dashboard (Home Tab)
- [ ] Pull-to-refresh updates stats
- [ ] Haptic feedback on "Verify" button tap
- [ ] Time-based greeting (morning/afternoon/evening)
- [ ] Streak flames scale correctly (max 5)
- [ ] Error banner appears on network failure

### ✅ Leaderboard Tab
- [ ] Global/Friends tab switcher works
- [ ] Medals show for top 3 (🥇🥈🥉)
- [ ] Current user row highlighted (blue border)
- [ ] Empty state shows "Invite Friends" button
- [ ] Real-time updates (test with multiple users)

### ✅ Profile Tab
- [ ] Stats load correctly
- [ ] Invite code displays (unique per user)
- [ ] Copy button shows success alert
- [ ] Share button opens iOS Share Sheet
- [ ] Friends list shows connected users
- [ ] Sign out redirects to login

---

## 📱 iOS Simulator Shortcuts

### Haptic Feedback Testing
**Note**: Haptics don't work in simulator. Test on physical device for:
- Verify button tap (Medium)
- Pull-to-refresh (Light)
- Successful verification (Success)
- Copy invite code (Success)

### Accessibility Testing (VoiceOver)
```
Settings → Accessibility → VoiceOver → ON
```
Then:
1. Swipe right/left to navigate
2. Double-tap to activate
3. Test all screens with eyes closed

---

## 🔥 Demo Data Setup

### Create Test Users
1. Sign up with 3+ accounts (use email aliases)
2. Each user completes 1-3 verifications
3. Connect users as friends via invite codes

### Test Leaderboard
```bash
# User A: 5 verifications (50 points)
# User B: 3 verifications (30 points)
# User C: 1 verification (10 points)

Expected Global Leaderboard:
1. 🥇 User A - 50 points
2. 🥈 User B - 30 points
3. 🥉 User C - 10 points
```

### Test Friends Flow
1. User A → Profile → Copy invite code
2. User B → (TODO: Accept invite screen)
3. User A → Profile → Friends list shows User B
4. User A → Leaderboard → Friends tab shows User B

---

## 🐛 Common Issues & Fixes

### "Expo Go not connecting"
```bash
# Restart dev server
npm start -- --clear

# Or use tunnel
npm start -- --tunnel
```

### "Firebase not initialized"
Check `src/config/firebase.ts` has valid config

### "Haptics not working"
Haptics only work on **physical devices**, not simulator

### "Tests failing"
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules && npm install
```

---

## 📊 Firestore Data Inspection

### Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project
3. Firestore Database → Data tab

### Check Collections
- `users` → User profiles, points, streaks
- `users/{userId}/verifications` → Daily verification records
- `users/{userId}/friends` → Friend connections
- `inviteCodes` → Active invite codes

---

## 🎨 UI Debugging

### React DevTools
```bash
# Install globally
npm install -g react-devtools

# Run
react-devtools

# Then reload Expo app
```

### Inspect Element (Web Only)
```bash
npm run web
```
Then use browser DevTools

---

## 📈 Performance Testing

### Firestore Query Performance
Test in Profile screen console logs:
```
measureLeaderboardPerformance('global')
→ Should be <500ms for 100 users
```

### Real-time Subscription Load
1. Open app on 2 devices
2. User A completes verification
3. User B's leaderboard should update instantly

---

## 🚢 Pre-Launch Checklist

### Code Quality
- [ ] Run `npm run type-check` (no TypeScript errors)
- [ ] Run `npm run lint` (no ESLint errors)
- [ ] Run `npm run format` (Prettier formatting)

### Testing
- [ ] All unit tests passing (`npm test`)
- [ ] Maestro E2E tests passing
- [ ] Manual QA checklist complete

### Accessibility
- [ ] VoiceOver navigation works end-to-end
- [ ] All buttons have labels
- [ ] Color contrast verified (use Stark plugin)

### Performance
- [ ] App loads <2 seconds on 4G
- [ ] Leaderboard queries <500ms
- [ ] No frame drops during animations

---

## 🆘 Getting Help

### Documentation
- [MULTI_PERSONA_UX_ANALYSIS.md](MULTI_PERSONA_UX_ANALYSIS.md) - UX audit & roadmap
- [P0_IMPLEMENTATION_COMPLETE.md](P0_IMPLEMENTATION_COMPLETE.md) - What's implemented
- [FIRESTORE_SCHEMA.md](FIRESTORE_SCHEMA.md) - Database structure
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) - UI patterns

### External Resources
- [Expo Docs](https://docs.expo.dev)
- [NativeWind Docs](https://www.nativewind.dev)
- [Maestro Docs](https://maestro.mobile.dev)
- [Firebase Docs](https://firebase.google.com/docs)

---

## 🎯 Next Implementation

See [MULTI_PERSONA_UX_ANALYSIS.md](MULTI_PERSONA_UX_ANALYSIS.md) → P1 Priorities:
1. Push notifications (daily reminders)
2. Analytics integration (Firebase/Mixpanel)
3. VerifyModal camera integration
4. Achievements system

---

**Happy Testing! 🎉**
