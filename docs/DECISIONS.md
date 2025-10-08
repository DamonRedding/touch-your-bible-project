# Touch Your Bible - Executive Decisions

**Date**: October 7, 2025
**Sprint**: 2-Week MVP to TestFlight

---

## 🎯 Critical Decisions

### 1. Platform Strategy
- **Decision**: iOS only for MVP, Android post-validation
- **Rationale**: 2-week timeline vs. 4 weeks, faster validation, reduced complexity
- **Owner**: Sarah (PM), Alex (Engineer)
- **Impact**: -50% development time

### 2. Feature Scope (MVP)

#### ✅ IN (Must Ship)
1. Daily Bible verification (honor system - tap confirmation)
2. Personal streak tracking (consecutive days)
3. Points system (streak = points)
4. Global leaderboard (all users, sorted by streak)
5. Friends leaderboard (separate tab, filtered by connections)
6. Invite system (unique codes: TOUCH-XXXX)
7. Invite bonus points (+10 per friend, max 5 invites)

#### ❌ OUT (Post-MVP v2)
- App blocking/control features (cut entirely)
- Photo verification (OCR, camera proof)
- Private groups (church, small groups)
- Achievements/badges system
- Push notifications
- Dark mode toggle
- QR code sharing
- Admin moderation tools

### 3. Leaderboard Technology
- **Decision**: Firestore queries with 5K user cap
- **Rationale**: Simple implementation, fast to ship, migrate to Cloud Functions if scale demands
- **Owner**: Marcus (Architect), Alex (Engineer)
- **Risk Mitigation**: Growth cap prevents runaway costs

### 4. Verification Method
- **Decision**: Honor system (single tap "I read today")
- **Rationale**: Trust users, reduce friction, intrinsic motivation
- **Owner**: Jordan (UX), Alex (Engineer)
- **Future**: Optional verified badge with photo proof (v2)

### 5. Friend System Mechanics
- **Decision**: Unique invite codes + iOS share sheet
- **Rationale**: Simple, no permissions, works remotely
- **Owner**: Priya (IA), Alex (Engineer)
- **Future**: QR codes (v2)

---

## 📅 2-Week Sprint Timeline

### Week 1: Core Features (Days 1-7)
| Day | Milestone | Owner |
|-----|-----------|-------|
| 1 | Firestore schema, data models, navigation | Marcus, Priya, Alex |
| 2 | IA complete, design system defined | Priya, Taylor |
| 3 | Verification flow working, wireframes approved | Alex, Jordan |
| 4 | Streak calculation logic | Alex |
| 5 | Points system, NativeWind inventory | Alex, Taylor |
| 6 | Global leaderboard functional | Alex |
| 7 | Friends leaderboard functional | Alex |

### Week 2: Polish + TestFlight (Days 8-14)
| Day | Milestone | Owner |
|-----|-----------|-------|
| 8 | Friend invite flow working | Alex |
| 9 | NativeWind UI integrated | Alex, Taylor |
| 10 | Animations + micro-interactions | Taylor, Jordan |
| 11 | Accessibility audit | Taylor, Alex |
| 12 | Internal testing, bug bash | All |
| 13 | All bugs fixed | Alex |
| 14 | TestFlight live | Alex, Sarah |

---

## ✅ Success Criteria

**Go-Live Requirements (Day 14)**:
- ✅ All 7 core features working
- ✅ Zero critical bugs (crashes, data loss)
- ✅ Accessibility baseline (WCAG 2.1 AA)
- ✅ Performance acceptable (<2s load times)

**User Metrics (Week 1 Post-Launch)**:
- 10+ TestFlight testers
- 50+ daily verifications
- 20+ friend connections
- <5% crash rate

---

## 🚀 Resource Optimization

### Use Off-the-Shelf
- ✅ NativeWind UI (buttons, cards, lists, modals)
- ✅ Expo Camera
- ✅ Firebase Auth
- ✅ Expo Router
- ✅ React Query

### Build Custom
- Firestore schema + queries
- Streak calculation logic
- Points algorithm
- Invite code generation
- Real-time listeners

### Remove/Avoid
- ❌ App detection service (unused)
- ❌ Custom auth
- ❌ Custom routing

---

## 📊 Team Consensus

**Unanimous Decisions**:
- iOS-first approach
- Honor system verification
- Firestore queries (no Cloud Functions yet)
- NativeWind UI utilization
- 60% scope reduction

**No Dissent**: All decisions ratified by full team
