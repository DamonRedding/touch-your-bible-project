# Touch Your Bible - Launch Checklist
**Quick Reference for Launch Readiness**
**Last Updated**: October 7, 2025

---

## 🚨 P0 BLOCKERS (Must Fix Before Launch)

### Camera Verification Integration
- [ ] **Step 1**: Set up Google Cloud Vision API (1 hour)
  - [ ] Create Google Cloud project
  - [ ] Enable Cloud Vision API
  - [ ] Generate API key
  - [ ] Restrict key to iOS bundle ID
  - [ ] Add key to `.env` file
  - [ ] Test with sample image

- [ ] **Step 2**: Create OCR service (2-3 hours)
  - [ ] Create `src/services/ocr.ts`
  - [ ] Implement `validateBiblePhoto()` function
  - [ ] Add Bible keywords list (books, verses, common phrases)
  - [ ] Add error handling for OCR failures
  - [ ] Test with 5+ different Bible translations

- [ ] **Step 3**: Update VerifyModal (2-3 hours)
  - [ ] Add camera state management
  - [ ] Replace manual button with "Open Camera" CTA
  - [ ] Add camera view modal
  - [ ] Implement photo capture handler
  - [ ] Add OCR processing indicator
  - [ ] Connect OCR result to verification flow
  - [ ] Add manual override after 3 OCR failures

- [ ] **Step 4**: Test camera flow (1-2 hours)
  - [ ] Test on physical iPhone (not simulator)
  - [ ] Verify camera permissions work
  - [ ] Test photo capture
  - [ ] Test OCR with good lighting
  - [ ] Test OCR with poor lighting (error handling)
  - [ ] Test success flow → confetti
  - [ ] Test error flow → retry

**Total Estimated Time**: 6-9 hours

### Onboarding Flow
- [ ] **Step 1**: Create OnboardingScreen (2-3 hours)
  - [ ] Create `src/screens/OnboardingScreen.tsx`
  - [ ] Design 4 slides (emoji, title, description)
  - [ ] Add horizontal scroll pagination
  - [ ] Add "Next" and "Skip" buttons
  - [ ] Add "Get Started" final CTA
  - [ ] Connect to AsyncStorage for persistence

- [ ] **Step 2**: Add to app routing (30 mins)
  - [ ] Create `src/app/onboarding.tsx`
  - [ ] Update `src/app/index.tsx` logic
  - [ ] Check onboarding completion on app start
  - [ ] Route to onboarding if first launch
  - [ ] Route to home if onboarding complete

- [ ] **Step 3**: Test onboarding (1 hour)
  - [ ] Test shows on first sign-up
  - [ ] Test does NOT show on subsequent launches
  - [ ] Test "Skip" button
  - [ ] Test "Next" button navigation
  - [ ] Test swipe gestures
  - [ ] Test "Get Started" navigation to Dashboard
  - [ ] Test reset functionality (debug mode)

**Total Estimated Time**: 3-4 hours

---

## ✅ COMPLETED FEATURES (No Action Needed)

### Core Features
- [x] Authentication (email/password + anonymous)
- [x] Manual verification flow (will be replaced with camera)
- [x] Streak tracking (current + longest, timezone-aware)
- [x] Points system (10 per verification)
- [x] Firestore integration (real-time updates)

### Social Features
- [x] Global leaderboard (top 100, real-time)
- [x] Friends leaderboard (real-time)
- [x] Medal emojis for top 3 (🥇🥈🥉)
- [x] Friend invites (code generation + sharing)
- [x] Friends list (display with streaks/points)
- [x] Invite code copy to clipboard
- [x] iOS Share sheet integration

### UX Polish
- [x] Pull-to-refresh (Dashboard + Leaderboard)
- [x] Haptic feedback (success, error, buttons)
- [x] Empty states (leaderboard, friends)
- [x] Error states (network failures, retry)
- [x] Loading states (ActivityIndicator + FlashList)
- [x] Confetti animation (200 particles, 4 colors)
- [x] Time-based greeting ("Good morning")
- [x] Already verified check (prevents duplicates)

### Design System
- [x] NativeWindUI integration complete
- [x] 11 semantic text variants
- [x] Consistent 4px/8px spacing
- [x] Touch targets >44pt
- [x] iOS-native patterns (tab bar, safe areas)
- [x] FlashList performance (6x faster)

---

## 🟡 P1 HIGH PRIORITY (Week 1 Post-Launch)

### Push Notifications (6-8 hours)
- [ ] Set up Firebase Cloud Messaging
- [ ] Request notification permissions
- [ ] Schedule daily reminder (8pm user local time)
- [ ] Handle notification tap → open app
- [ ] Test on physical device
- [ ] Add "Enable Notifications" in settings

### Analytics Tracking (2-3 hours)
- [ ] Set up Firebase Analytics
- [ ] Add event tracking:
  - [ ] `sign_up` (email vs anonymous)
  - [ ] `verification_started` (camera opened)
  - [ ] `verification_completed` (success)
  - [ ] `verification_failed` (OCR error)
  - [ ] `invite_sent` (share button tapped)
  - [ ] `leaderboard_viewed` (tab switched)
  - [ ] `friend_added` (invite code accepted)
- [ ] Test events in Firebase console

### VoiceOver Accessibility (3-4 hours)
- [ ] Enable VoiceOver on iPhone
- [ ] Test Dashboard navigation
- [ ] Test Leaderboard navigation
- [ ] Test Profile navigation
- [ ] Test VerifyModal (camera flow)
- [ ] Test Onboarding slides
- [ ] Add missing `accessibilityLabel` props
- [ ] Add `accessibilityHint` where needed
- [ ] Test screen reader announcements (streak updates)

### Visual Consistency (30 mins)
- [ ] Standardize primary blue color
  - [ ] Change all `#2196F3` to `#3B82F6`
  - [ ] Update Dashboard ActivityIndicator
  - [ ] Update button colors
- [ ] Standardize empty state emoji sizes
  - [ ] Leaderboard: `text-6xl`
  - [ ] Friends list: `text-6xl`
  - [ ] Profile: `text-6xl`

---

## 🟢 P2 NICE TO HAVE (Month 1)

### Retention Features (4-6 hours)
- [ ] Streak freeze system
  - [ ] UI to purchase freeze (100 points)
  - [ ] Backend logic to apply freeze
  - [ ] Notification when streak protected
- [ ] Weekly recap notification
  - [ ] Calculate weekly stats
  - [ ] Send Sunday 6pm reminder
  - [ ] Show "You verified 5/7 days this week"

### Growth Features (3-4 hours)
- [ ] Social sharing
  - [ ] "Share Streak" button in Profile
  - [ ] Generate shareable image (streak + app logo)
  - [ ] iOS Share sheet with Instagram Stories, Twitter
- [ ] Friend activity feed
  - [ ] Show "Sarah just verified! 12-day streak"
  - [ ] Real-time updates in Dashboard
  - [ ] Limit to 5 most recent activities

### Engagement Features (8-10 hours)
- [ ] Achievements/Badges system
  - [ ] Design 10+ badges (7, 30, 100 days, etc.)
  - [ ] Backend logic for unlocking
  - [ ] Achievement modal on unlock
  - [ ] Badge display in Profile
- [ ] Streak milestones
  - [ ] Special confetti at 7, 30, 100 days
  - [ ] Milestone modal ("You hit 30 days!")
  - [ ] Share milestone to social media

### Accessibility Enhancements (3-4 hours)
- [ ] Dynamic Type support
  - [ ] Test with largest text size
  - [ ] Ensure no text truncation
  - [ ] Update layouts for flexibility
- [ ] Reduce Motion support
  - [ ] Detect `prefers-reduced-motion`
  - [ ] Replace confetti with static emoji
  - [ ] Disable animations if enabled
- [ ] Color contrast testing
  - [ ] Test all text/background combos
  - [ ] Ensure 4.5:1 minimum ratio
  - [ ] Fix any failing combinations

---

## 📱 DEVICE TESTING (Pre-Launch)

### Physical Device Tests
- [ ] Test on iPhone 11 or older (iOS 17)
- [ ] Test on iPhone 15 Pro Max (latest)
- [ ] Test on iPhone SE (small screen)
- [ ] Camera permissions (allow + deny scenarios)
- [ ] Photo capture quality
- [ ] OCR accuracy (5+ Bible translations)
- [ ] Network offline handling
- [ ] Background app refresh
- [ ] Memory usage (no leaks)

### Core User Flows
- [ ] Sign up → Onboarding → Dashboard
- [ ] Verify reading → Camera → OCR → Confetti
- [ ] View leaderboard → Switch tabs → Pull refresh
- [ ] Invite friend → Share code → Copy clipboard
- [ ] View profile → See stats → Sign out
- [ ] Sign in again → Skip onboarding → Dashboard

### Edge Cases
- [ ] Already verified today (show banner)
- [ ] OCR fails 3 times (manual override)
- [ ] Network timeout (retry mechanism)
- [ ] Empty leaderboard (encouraging message)
- [ ] No friends (invite CTA)
- [ ] Camera permission denied (Settings link)

---

## 🚀 TESTFLIGHT SUBMISSION

### Pre-Submission
- [ ] All P0 blockers fixed and tested
- [ ] `.env` file has valid Google Cloud Vision key
- [ ] Bundle identifier correct: `com.touchyourbible.app`
- [ ] App icon added (1024x1024)
- [ ] Launch screen configured
- [ ] Info.plist has camera permission description
- [ ] Version number updated: `1.0.0` (build 1)
- [ ] No debug console.logs in production code
- [ ] .gitignore excludes `.env` file

### Build Steps
```bash
# 1. Clean install dependencies
npm ci

# 2. Prebuild for iOS
npx expo prebuild --clean

# 3. Build for TestFlight
eas build --platform ios --profile preview

# 4. Wait for build to complete (~10-15 mins)

# 5. Submit to TestFlight
eas submit --platform ios
```

### Post-Submission
- [ ] Recruit 10-20 beta testers
- [ ] Send TestFlight invite links
- [ ] Set up crash reporting (Sentry or Crashlytics)
- [ ] Monitor Firebase Analytics
- [ ] Create feedback survey (Google Forms)
- [ ] Plan daily check-ins for first week

---

## 📊 SUCCESS METRICS (Week 1 Beta)

### Acquisition
- [ ] Sign-up completion rate: >80%
- [ ] Onboarding completion rate: >90%
- [ ] First verification rate: >60%

### Engagement
- [ ] Daily Active Users (DAU): Track baseline
- [ ] Verification completion rate: >70% of DAUs
- [ ] Average session duration: >2 minutes
- [ ] Leaderboard views per DAU: >1

### Retention
- [ ] Day 1 retention: >60%
- [ ] Day 3 retention: >50%
- [ ] Day 7 retention: >40%
- [ ] Streak abandonment rate: <30%

### Technical
- [ ] Crash-free rate: >99%
- [ ] OCR success rate: >80%
- [ ] Camera permission grant rate: >70%
- [ ] Average OCR processing time: <3 seconds

### Feedback
- [ ] Collect qualitative feedback (survey)
- [ ] Identify top 3 pain points
- [ ] Identify top 3 feature requests
- [ ] NPS score (if applicable)

---

## 🎯 DEFINITION OF DONE

### P0 Blockers Complete
- ✅ Camera verification works end-to-end
- ✅ OCR validates Bible text (>80% accuracy)
- ✅ Onboarding shows on first launch only
- ✅ Manual override available after 3 OCR failures
- ✅ All user flows tested on physical device
- ✅ No critical bugs identified

### App Quality Standards
- ✅ No crashes during 30-minute test session
- ✅ Haptic feedback works consistently
- ✅ Loading states clear and not excessive
- ✅ Error messages user-friendly
- ✅ Navigation intuitive (no dead ends)
- ✅ Visual consistency maintained

### Launch Readiness
- ✅ TestFlight build uploaded
- ✅ Beta testers recruited (10-20 people)
- ✅ Crash reporting active
- ✅ Analytics tracking live
- ✅ Feedback survey ready
- ✅ Support email monitored

---

## 🔄 ITERATION PLAN

### Week 1: Monitor + Stabilize
- Fix P0 bugs reported by beta testers
- Monitor crash reports daily
- Respond to feedback within 24 hours
- Track success metrics

### Week 2: Add P1 Features
- Implement push notifications
- Improve OCR accuracy based on feedback
- Add VoiceOver improvements
- Fix visual inconsistencies

### Week 3: Prepare Public Launch
- Implement top feature requests (if feasible)
- Polish UI based on feedback
- Write App Store description
- Create screenshots + preview video
- Submit for App Store Review

### Week 4: Public Launch
- Release to App Store
- Monitor reviews and ratings
- Scale beta learnings to broader audience
- Plan Month 2 features (P2 priorities)

---

## 📞 SUPPORT CONTACTS

### Technical Issues
- Google Cloud Vision API: [Cloud Console](https://console.cloud.google.com)
- Firebase: [Firebase Console](https://console.firebase.google.com)
- Expo: [Expo Dashboard](https://expo.dev)

### Documentation
- Implementation Guide: `/P0_BLOCKER_IMPLEMENTATION_GUIDE.md`
- Gap Analysis: `/UX_GAP_ANALYSIS_FINAL.md`
- Launch Summary: `/LAUNCH_READINESS_SUMMARY.md`

### Emergency Contacts
- Product Lead: [Name]
- Engineering Lead: [Name]
- Design Lead: [Name]

---

**Print this checklist and track progress daily!**

**Last Review**: October 7, 2025
**Next Review**: After P0 completion (pre-TestFlight)
**Status**: 🟡 80% Ready - 2 blockers remain
