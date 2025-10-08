# Touch Your Bible - Executive Roundtable Decisions

**Date**: October 7, 2025
**Session**: Sprint Planning Roundtable
**Status**: ✅ Decisions Finalized - Execution Begins

---

## 📊 Codebase Validation Results

**Analysis Completed**: October 7, 2025 @ 16:30 PST

### Key Discovery: Services More Complete Than Estimated

**Backend Services (Production-Ready)**:
- ✅ [leaderboard.ts](../src/services/leaderboard.ts) - 277 lines
  - Global leaderboard queries
  - Friends leaderboard queries
  - Real-time subscriptions (onSnapshot)
  - Rank calculation utilities
  - Performance monitoring
- ✅ [friends.ts](../src/services/friends.ts) - 368 lines
  - Bidirectional friend connections
  - Friend stats synchronization
  - Mutual friends detection
  - Complete CRUD operations
- ✅ [invites.ts](../src/services/invites.ts) - 258 lines
  - Unique invite code generation (TOUCH-XXXX)
  - Validation & redemption logic
  - Bonus points attribution
  - Max 5 invites enforcement

**Infrastructure (Ready)**:
- ✅ Firestore indexes pre-configured ([firestore.indexes.json](../firestore.indexes.json))
- ✅ Security rules defined ([firestore.rules](../firestore.rules))
- ✅ Type definitions complete ([src/types/firestore.ts](../src/types/firestore.ts))

**Impact on Timeline**:
- **Original Estimate**: 5.5 days for Week 1 core features
- **Revised Estimate**: 3.5 days (services just need UI wiring)
- **Time Saved**: 2 days → enables friends/invites in Week 1

---

## 🎯 DECISION 1: Platform Strategy

**Decision**: iOS-only for MVP TestFlight (Day 14)
**Status**: ✅ **APPROVED** - Unanimous

### Details
- **Deployment**: iOS TestFlight only
- **Development**: Code remains cross-platform (Expo/React Native)
- **Testing**: iOS devices and simulators only
- **Future**: Android launch post-validation (Week 3+)

### Actions Completed
- ✅ Removed Android-specific packages:
  - `@brighthustle/react-native-usage-stats-manager`
  - `@quibr/react-native-screen-time-api`
- ✅ Cleaned package.json (79 packages removed)
- ✅ Updated documentation to reflect iOS-first approach

### Rationale
- **Focus**: Single platform = faster iteration
- **Speed**: One TestFlight process vs. two app stores
- **Feedback**: Concentrated user testing
- **Risk**: Expo keeps us cross-platform if we need Android later

**Owner**: Sarah (PM), Alex (Engineer)
**Commit**: `8690195` - "chore: remove dead code and Android dependencies"

---

## 🎯 DECISION 2: Week 1 Scope (REVISED)

**Original Consensus**: Week 1 = Solo experience only (no friends)
**Roundtable Challenge**: Sarah challenged, team revised
**Final Decision**: ✅ **APPROVED** - Week 1 includes Basic Social

### Scope Breakdown

**Days 1-3: Core Loop**
- Dashboard rebuild (verification CTA, streak display)
- Verification modal (honor system tap + confetti)
- Streak calculation logic (Firestore writes)
- Points system (streak points)

**Days 4-5: Global Leaderboard**
- React Query hooks for real-time Firestore listeners
- Leaderboard UI (NativeWind list components)
- Loading/error states
- User rank display

**Days 6-7: Basic Social** (NEW - added to Week 1)
- Invite code display in profile
- iOS share sheet integration
- Friends leaderboard tab (reuses global UI)
- Friend connection on invite redeem

### Go/No-Go Checkpoint
**Date**: End of Day 5 (October 12, 2025)
**Criteria**:
- ✅ Verification working (honor system)
- ✅ Streak calculation accurate
- ✅ Global leaderboard real-time updates
- ✅ Zero critical bugs
- ⚠️ **If ANY blocker**: Cut friends back to Week 2

### Rationale for Revision
**Evidence-Based**:
- Friends service complete (368 lines, bidirectional sync)
- Invites service complete (258 lines, code generation ready)
- Friends leaderboard: 1 function call (already implemented)
- Work is UI wiring, not backend logic

**User Experience**:
- Leaderboard without friends feels incomplete
- "Where are my friends?" will be Day 1 question
- Invites = viral growth from Day 1, not delayed to Week 2

**Cognitive Load (addressed)**:
- Progressive disclosure: Global leaderboard default
- Friends tab secondary (empty state with CTA)
- Natural progression: Solo Day 1 → Social Day 2

**Team Alignment**:
- Marcus (Architect): ✅ Approved (services complete, just UI)
- Priya (IA): ✅ Approved (progressive disclosure works)
- Jordan (UX): ✅ Approved (verification priority maintained)
- Alex (Engineer): ✅ Committed (timeline realistic)

**Owner**: Sarah (PM), All team
**Dissent**: None (revised from initial plan)

---

## 🎯 DECISION 3: Leaderboard Scope

**Decision**: Both Global + Friends by end of Week 1
**Status**: ✅ **APPROVED** - Unanimous

### MVP Features
**Included**:
- ✅ Global leaderboard (top 100 users)
- ✅ Friends leaderboard (all connected friends)
- ✅ Real-time updates (Firestore onSnapshot listeners)
- ✅ User's current rank display
- ✅ Points + Streak sorting

**Deferred to v2**:
- ❌ Search/filter functionality
- ❌ Infinite scroll (pagination)
- ❌ Leaderboard history/trends
- ❌ Alternative sorting (by streak only, by total days)

### Implementation
- Use existing [leaderboard.ts](../src/services/leaderboard.ts) services
- NativeWind UI list components (no custom scrolling)
- React Query for data management
- Optimistic UI updates

**Owner**: Alex (Engineer), Taylor (Visual Designer)

---

## 🎯 DECISION 4: Confirmed Feature Cuts

**Status**: ✅ **APPROVED** - No changes from original plan

### Out of MVP (v2 or Later)
- ❌ Onboarding screens (use empty states + in-app guidance)
- ❌ Photo verification / OCR (honor system only)
- ❌ Achievements / Badges system
- ❌ Push notifications
- ❌ Dark mode toggle (system default only)
- ❌ Private groups (church, small groups)
- ❌ QR code sharing (iOS share sheet only)
- ❌ Admin moderation tools

### Dead Code Removed (TODAY - Completed)
- ✅ AppDetectionServiceImpl.ts (10KB, app blocking logic)
- ✅ app-usage-test.tsx screen
- ✅ AppUsageTestScreen.tsx
- ✅ Android packages (usage-stats-manager, screen-time-api)

**Actions Completed**:
```bash
npm uninstall @brighthustle/react-native-usage-stats-manager
npm uninstall @quibr/react-native-screen-time-api
rm src/services/AppDetectionServiceImpl.ts
rm src/app/(home)/app-usage-test.tsx
rm src/screens/AppUsageTestScreen.tsx
```

**Owner**: Alex (Engineer) - ✅ **COMPLETE**
**Commit**: `8690195`

---

## 🎯 DECISION 5: NativeWind UI Strategy

**Decision**: Maximize NativeWind UI + Magic MCP usage
**Status**: ✅ **APPROVED** - Unanimous

### Component Inventory

| Component Type | Source | Priority | Timeline |
|----------------|--------|----------|----------|
| **Buttons** | NativeWind UI | P0 | Day 2 |
| **Cards** | NativeWind UI | P0 | Day 2 |
| **Modals** | NativeWind UI | P0 | Day 2 |
| **Lists** | NativeWind UI | P0 | Day 4 |
| **Tab Icons** | @roninoss/icons | P0 | ✅ Day 1 DONE |
| **Confetti** | react-native-reanimated | P1 | Day 3 |
| **Loading States** | NativeWind UI | P2 | Day 4 |

### Magic MCP Usage Plan
- **Verification Modal**: Generate UI layout (Day 2)
- **Leaderboard List**: Generate card/list styling (Day 4)
- **Profile Stats**: Generate stats display cards (Day 5)

### Actions Completed (Day 1)
- ✅ Replaced emoji tab icons (🏠🏆👤) with proper icons
- ✅ Implemented @roninoss/icons:
  - Home: `home` (house icon)
  - Leaderboard: `trophy` (trophy icon)
  - Profile: `account-circle` (user icon)
- ✅ Updated [_layout.tsx](../src/app/(home)/_layout.tsx) with Icon component

### Time Savings Estimate
- **Manual coding**: ~3 days for all components
- **NativeWind UI + Magic**: ~1.5 days
- **Savings**: 1.5 days (50% reduction)

**Owner**: Taylor (Visual Designer), Alex (Engineer)
**Status**: Day 1 actions ✅ **COMPLETE**

---

## 📅 REVISED 2-WEEK SPRINT PLAN

### Week 1: Core Features + Basic Social (Days 1-7)

| Day | Milestone | Owner | Status |
|-----|-----------|-------|--------|
| **1** | ✅ Remove dead code, replace tab icons, Firestore indexes | Alex, Marcus, Taylor | ✅ **COMPLETE** |
| **2** | Dashboard rebuild, verification modal UI | Alex, Taylor | Pending |
| **3** | Streak logic, Firestore writes, confetti | Alex | Pending |
| **4** | Global leaderboard (backend + UI) | Alex, Taylor | Pending |
| **5** | Global leaderboard polish + **GO/NO-GO CHECKPOINT** | Alex, Sarah | Pending |
| **6** | Friends leaderboard, invite code display | Alex, Taylor | Pending |
| **7** | Invite sharing (iOS share sheet) | Alex | Pending |

### Week 2: Polish + TestFlight (Days 8-14)

| Day | Milestone | Owner | Status |
|-----|-----------|-------|--------|
| **8** | NativeWind UI integration (buttons, cards) | Taylor, Alex | Pending |
| **9** | Micro-interactions, animations | Taylor | Pending |
| **10** | Loading states, error handling | Alex, Jordan | Pending |
| **11** | Accessibility audit (VoiceOver, contrast) | Taylor, Jordan | Pending |
| **12** | Internal testing, bug bash | All | Pending |
| **13** | Bug fixes, final polish | Alex | Pending |
| **14** | TestFlight submission | Alex, Sarah | Pending |

---

## 🚀 NEXT 24-HOUR ACTIONS

### Marcus (Architect) - By EOD Day 1
- [x] ✅ Firestore indexes already exist ([firestore.indexes.json](../firestore.indexes.json))
- [ ] Validate indexes deployed to Firebase Console
- [ ] Document any missing indexes

### Alex (Engineer) - Day 1 COMPLETE ✅
- [x] ✅ Remove Android packages (npm uninstall)
- [x] ✅ Delete dead code files
- [x] ✅ Clean package.json
- [x] ✅ Replace emoji tab icons with @roninoss/icons
- [x] ✅ Commit cleanup: `8690195`

**Next**: Day 2 - Dashboard rebuild + verification modal

### Taylor (Visual Designer) - By EOD Day 1
- [ ] Design verification modal (exact NativeWind component specs)
- [ ] Create component inventory document (NativeWind UI mapping)
- [ ] Document color tokens from DESIGN_SYSTEM.md

### Jordan (UX Designer) - Tomorrow (Day 2)
- [ ] Collaborate with Alex on verification modal UX
- [ ] Define empty state messaging for all screens
- [ ] Review dashboard wireframe (verification CTA placement)

### Priya (IA) - Tomorrow (Day 2)
- [ ] Validate navigation flows with new Week 1 scope
- [ ] Update [NAVIGATION.md](../docs/NAVIGATION.md) if needed (friends added to Week 1)

---

## ✅ SUCCESS METRICS

### Day 5 Checkpoint (Go/No-Go for Friends)
- ✅ Verification working (honor system tap)
- ✅ Streak calculation accurate (timezone handling)
- ✅ Global leaderboard real-time updates
- ✅ Zero critical bugs
- ✅ Performance <500ms for leaderboard queries

### Day 14 (TestFlight Launch)
- ✅ All 7 core features working (verify, streak, points, global, friends, invite, profile)
- ✅ Zero crashes in testing
- ✅ Accessibility baseline (VoiceOver labels, WCAG 2.1 AA contrast)
- ✅ Performance <2s load times
- ✅ TestFlight build submitted

### Week 1 Post-Launch
- 10+ TestFlight testers
- 50+ daily verifications
- 20+ friend connections
- <5% crash rate

---

## 📝 TEAM CONSENSUS

**Unanimous Approvals**:
1. ✅ iOS-only TestFlight (platform strategy)
2. ✅ Week 1 includes friends/invites (REVISED from original)
3. ✅ Both global + friends leaderboards by Day 7
4. ✅ Honor system verification (no photo)
5. ✅ NativeWind UI + Magic MCP maximization

**No Dissent**: All decisions ratified by full executive team

**Participants**:
- Sarah (Senior PM) - Scope authority, final decisions
- Marcus (Enterprise Architect) - Technical validation, infrastructure
- Priya (Information Architect) - User flows, navigation, IA
- Alex (Lead Engineer) - Implementation, timeline commitments
- Jordan (UX Designer) - User experience, interaction patterns
- Taylor (Visual Designer) - UI polish, NativeWind expertise

---

**Roundtable Status**: ✅ **COMPLETE**
**Execution Status**: 🔄 **IN PROGRESS** (Day 1 complete)
**Next Session**: Day 5 Go/No-Go Checkpoint

**Last Updated**: October 7, 2025 @ 17:15 PST
