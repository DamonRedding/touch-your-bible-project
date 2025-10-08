# Firestore Schema - Visual Diagrams

## Collection Structure

```
📊 Firestore Database
│
├─📁 users/                                    [Root Collection]
│  │
│  ├─📄 {userId}                               [User Document]
│  │  ├─ id: string
│  │  ├─ email: string
│  │  ├─ displayName?: string
│  │  ├─ currentStreak: number
│  │  ├─ points: number ⭐
│  │  ├─ inviteCode: string (TOUCH-XXXX)
│  │  ├─ inviteCount: number (max 5)
│  │  ├─ ... (see schema)
│  │  │
│  │  ├─📁 friends/                            [Subcollection]
│  │  │  │
│  │  │  ├─📄 {friendId}                       [Friend Document - Cached]
│  │  │  │  ├─ userId: string
│  │  │  │  ├─ displayName?: string
│  │  │  │  ├─ points: number (cached)
│  │  │  │  ├─ currentStreak: number (cached)
│  │  │  │  ├─ connectedAt: Timestamp
│  │  │  │  └─ lastSyncAt: Timestamp
│  │  │  │
│  │  │  └─📄 {friendId}
│  │  │     └─ ... (more friends)
│  │  │
│  │  └─📁 verifications/                      [Optional Subcollection]
│  │     │
│  │     ├─📄 {verificationId}                 [Verification Log]
│  │     │  ├─ userId: string
│  │     │  ├─ verifiedAt: Timestamp
│  │     │  ├─ method: 'honor-system'
│  │     │  └─ pointsAwarded: number
│  │     │
│  │     └─📄 {verificationId}
│  │        └─ ... (more verifications)
│  │
│  └─📄 {userId}
│     └─ ... (more users)
│
└─📁 invites/                                  [Root Collection]
   │
   ├─📄 TOUCH-A3F9                             [Invite Document]
   │  ├─ code: string (TOUCH-XXXX)
   │  ├─ createdBy: string (userId)
   │  ├─ usedBy: string[] (max 5)
   │  ├─ useCount: number (0-5)
   │  ├─ maxUses: 5
   │  └─ isActive: boolean
   │
   └─📄 TOUCH-B7K2
      └─ ... (more invite codes)
```

---

## Data Flow Diagrams

### 1. User Signup Flow

```
┌─────────────┐
│   New User  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  Generate Invite Code           │
│  Format: TOUCH-XXXX              │
│  Check uniqueness (retry if dup)│
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Create User Document           │
│  - email, createdAt             │
│  - currentStreak: 0             │
│  - points: 0                    │
│  - inviteCode: TOUCH-XXXX       │
│  - inviteCount: 0               │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Create Invite Document         │
│  ID: TOUCH-XXXX                 │
│  - createdBy: userId            │
│  - useCount: 0                  │
│  - maxUses: 5                   │
└─────────────────────────────────┘
```

### 2. Invite Redemption Flow

```
┌──────────────┐
│  User Enters │
│  Invite Code │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│  Validate Code           │
│  - Exists?               │
│  - Active?               │
│  - Not self-referral?    │
│  - Not already used?     │
└──────┬───────────────────┘
       │ ✅ Valid
       ▼
┌──────────────────────────────────┐
│  🔒 TRANSACTION START             │
│                                   │
│  1. Update Invite Document        │
│     - Add user to usedBy[]        │
│     - Increment useCount          │
│     - Set isActive (if count < 5) │
│                                   │
│  2. Update New User               │
│     - Set invitedBy: referrerId   │
│                                   │
│  3. Update Referrer               │
│     - Increment inviteCount       │
│     - Add 10 to invitePoints      │
│     - Add 10 to points            │
│     (only if inviteCount < 5)     │
│                                   │
│  🔒 TRANSACTION COMMIT            │
└───────────────────────────────────┘
```

### 3. Friend Connection Flow

```
┌─────────────────────────┐
│  User A sends invite    │
│  to User B              │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Get both user documents        │
│  - User A data                  │
│  - User B data                  │
└──────────┬──────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  🔒 BATCH WRITE START             │
│                                   │
│  1. Add to User A's friends/      │
│     users/{userA}/friends/{userB} │
│     - Cache User B's stats        │
│                                   │
│  2. Add to User B's friends/      │
│     users/{userB}/friends/{userA} │
│     - Cache User A's stats        │
│                                   │
│  🔒 BATCH WRITE COMMIT            │
└───────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  ✅ Bidirectional Friendship     │
│     Both users have each other  │
└─────────────────────────────────┘
```

### 4. Daily Verification Flow

```
┌──────────────────┐
│  User taps       │
│  "I read today"  │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────────┐
│  Update User Stats             │
│  - Increment currentStreak     │
│  - Update longestStreak (if >)  │
│  - Increment totalVerifications│
│  - Add 1 to streakPoints       │
│  - Add 1 to points             │
│  - Set lastVerificationAt      │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  🔄 Background: Sync to Friends │
│  - Query all users who have    │
│    this user as friend         │
│  - Batch update cached stats   │
│    in their friends/ docs      │
└────────────────────────────────┘
```

### 5. Leaderboard Query Flow

```
                    ┌─────────────────┐
                    │  User Opens     │
                    │  Leaderboard    │
                    └────────┬────────┘
                             │
                    ┌────────▼─────────┐
                    │   Which Type?    │
                    └────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌───────────────────┐     ┌──────────────────────┐
    │  Global           │     │  Friends             │
    │  Leaderboard      │     │  Leaderboard         │
    └─────────┬─────────┘     └──────────┬───────────┘
              │                           │
              ▼                           ▼
    ┌─────────────────────┐     ┌────────────────────────┐
    │  Query users/       │     │  Query users/{userId}/ │
    │  ORDER BY:          │     │        friends/        │
    │  - points DESC      │     │  ORDER BY:             │
    │  - currentStreak    │     │  - points DESC         │
    │    DESC             │     │  - currentStreak DESC  │
    │  - createdAt ASC    │     │  - connectedAt ASC     │
    │  LIMIT 100          │     └──────────┬─────────────┘
    └─────────┬───────────┘                │
              │                            │
              │  ⚡ Index Required          │  ⚡ Index Required
              │  [points, streak, date]    │  [points, streak, date]
              │                            │
              ▼                            ▼
    ┌─────────────────────┐     ┌────────────────────────┐
    │  Add rank to each   │     │  Add rank to each      │
    │  entry (1-100)      │     │  entry (1-N)           │
    └─────────┬───────────┘     └──────────┬─────────────┘
              │                            │
              ▼                            ▼
    ┌─────────────────────┐     ┌────────────────────────┐
    │  🔄 Real-time        │     │  🔄 Real-time           │
    │     Updates          │     │     Updates            │
    │  (onSnapshot)        │     │  (onSnapshot)          │
    └──────────────────────┘     └────────────────────────┘
```

---

## Security Rules Flow

```
                    ┌─────────────────┐
                    │  Client Request │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Is Authenticated?│
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   YES      NO   │
                    │              │  │
                    │              └──┼──► ❌ DENY
                    │                 │
                    ▼                 │
        ┌─────────────────────────┐  │
        │  What Operation?        │  │
        └────────┬────────────────┘  │
                 │                    │
    ┌────────────┼────────────┐       │
    │            │            │       │
    ▼            ▼            ▼       │
┌──────┐    ┌──────┐    ┌──────────┐ │
│ READ │    │WRITE │    │ DELETE   │ │
└───┬──┘    └───┬──┘    └────┬─────┘ │
    │           │             │       │
    ▼           ▼             ▼       │
┌────────┐  ┌──────────────────┐  ┌─────────┐
│ Allow  │  │  Validation      │  │ Only    │
│ if     │  │  Rules:          │  │ Own     │
│ signed │  │  - Is owner?     │  │ Profile │
│ in     │  │  - Points calc?  │  │         │
└────────┘  │  - Invite limit? │  └─────────┘
            │  - Field locked? │
            └────────┬─────────┘
                     │
            ┌────────▼─────────┐
            │  ALL PASS?       │
            └────────┬─────────┘
                     │
            ┌────────▼─────────┐
            │  YES       NO    │
            │  ✅        ❌     │
            └──────────────────┘
```

---

## Index Optimization

```
Global Leaderboard Query:
┌─────────────────────────────────────────────────┐
│  SELECT * FROM users                            │
│  ORDER BY points DESC,                          │
│           currentStreak DESC,                   │
│           createdAt ASC                         │
│  LIMIT 100                                      │
└─────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────┐
│  🔍 Composite Index Required:                   │
│  [points DESC, currentStreak DESC, createdAt]   │
│                                                 │
│  ⚡ Performance:                                │
│  - Without index: O(n log n) - SLOW            │
│  - With index: O(100) - FAST (<200ms)          │
└─────────────────────────────────────────────────┘

Friends Leaderboard Query:
┌─────────────────────────────────────────────────┐
│  SELECT * FROM users/{userId}/friends           │
│  ORDER BY points DESC,                          │
│           currentStreak DESC,                   │
│           connectedAt ASC                       │
└─────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────┐
│  🔍 Composite Index Required:                   │
│  [points DESC, currentStreak DESC, connectedAt] │
│                                                 │
│  ⚡ Performance:                                │
│  - Typical: ~5-20 friends = <100ms             │
│  - Max: 100 friends = ~150ms                   │
└─────────────────────────────────────────────────┘
```

---

## Points Calculation Logic

```
┌─────────────────────────────────────────────┐
│  User Points Breakdown                      │
│                                             │
│  points = streakPoints + invitePoints       │
│                                             │
│  ┌─────────────────┐   ┌─────────────────┐ │
│  │  Streak Points  │   │  Invite Points  │ │
│  │                 │   │                 │ │
│  │  = currentStreak│   │  = inviteCount  │ │
│  │                 │   │    × 10         │ │
│  │  (1 per day)    │   │                 │ │
│  │                 │   │  Max: 5 × 10    │ │
│  │  Example:       │   │      = 50       │ │
│  │  7 day streak   │   │                 │ │
│  │  = 7 points     │   │  Example:       │ │
│  └─────────────────┘   │  3 invites      │ │
│                        │  = 30 points    │ │
│                        └─────────────────┘ │
│                                             │
│  Total: 7 + 30 = 37 points                 │
│                                             │
│  ✅ Validated by Security Rules             │
└─────────────────────────────────────────────┘
```

---

## Friend Stats Sync

```
User A verifies reading:
┌─────────────────────────┐
│  Update User A Profile  │
│  - points: 10 → 11      │
│  - currentStreak: 10→11 │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│  Query: Who has User A as friend?       │
│  collectionGroup('friends')             │
│    .where('userId', '==', userA)        │
└───────────┬─────────────────────────────┘
            │
            ▼ Found: [userB, userC, userD]
┌─────────────────────────────────────────┐
│  Batch Update Friend Documents:         │
│                                         │
│  users/userB/friends/userA              │
│    ├─ points: 11                        │
│    ├─ currentStreak: 11                 │
│    └─ lastSyncAt: now                   │
│                                         │
│  users/userC/friends/userA              │
│    ├─ points: 11                        │
│    ├─ currentStreak: 11                 │
│    └─ lastSyncAt: now                   │
│                                         │
│  users/userD/friends/userA              │
│    ├─ points: 11                        │
│    ├─ currentStreak: 11                 │
│    └─ lastSyncAt: now                   │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│  ✅ Friends see updated stats in their  │
│     leaderboard without re-query        │
└─────────────────────────────────────────┘
```

---

## Scaling Architecture

```
MVP (0-5K Users)
┌─────────────────────────────────────┐
│  📱 Client                          │
│  ├─ React Native                    │
│  ├─ Firebase SDK                    │
│  └─ Real-time listeners             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  🔥 Firestore                       │
│  ├─ Direct queries                  │
│  ├─ Denormalized data               │
│  ├─ Composite indexes               │
│  └─ ~$5-10/month                    │
└─────────────────────────────────────┘

V2 (5K-50K Users)
┌─────────────────────────────────────┐
│  📱 Client                          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  💾 Redis Cache                     │
│  ├─ Top 100 leaderboard             │
│  ├─ 5 min TTL                       │
│  └─ ~70% cost savings               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  🔥 Firestore                       │
│  ├─ Batch friend sync (5 min)       │
│  ├─ Pagination                      │
│  └─ ~$50-100/month                  │
└─────────────────────────────────────┘

V3 (50K+ Users)
┌─────────────────────────────────────┐
│  📱 Client                          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  ☁️  Cloud Functions                │
│  ├─ Leaderboard calculation         │
│  ├─ Distributed counters            │
│  └─ Tree-based ranking              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  🔥 Firestore                       │
│  └─ Event sourcing                  │
└─────────────────────────────────────┘
```

---

## Error Handling Flow

```
Invite Redemption:
┌─────────────────┐
│  User enters    │
│  invite code    │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│  validateInviteCode()    │
└────────┬─────────────────┘
         │
    ┌────▼────┐
    │  Valid? │
    └────┬────┘
         │
    ┌────▼──────────────────────────┐
    │ YES              NO            │
    │                               │
    ▼                               ▼
┌─────────────┐          ┌──────────────────┐
│ Proceed to  │          │ Return error:    │
│ redeemCode()│          │ - Invalid code   │
└─────┬───────┘          │ - Expired        │
      │                  │ - Already used   │
      ▼                  └──────────────────┘
┌──────────────────────┐
│  🔒 Transaction      │
└────┬─────────────────┘
     │
┌────▼───────────────────┐
│  Transaction fails?    │
└────┬───────────────────┘
     │
┌────▼──────────────────────────┐
│ YES              NO            │
│                               │
▼                               ▼
┌─────────────────┐   ┌───────────────────┐
│ Return error:   │   │ ✅ Success         │
│ - Already used  │   │ Points awarded    │
│ - Max reached   │   │ Friends connected │
│ - Self-referral │   └───────────────────┘
└─────────────────┘
```

---

**Visual Guide Complete** ✅

For detailed implementation, see:
- [FIRESTORE_SCHEMA.md](./FIRESTORE_SCHEMA.md) - Full specification
- [FIRESTORE_QUICK_START.md](./FIRESTORE_QUICK_START.md) - Code examples
- [SCHEMA_SUMMARY.md](./SCHEMA_SUMMARY.md) - Executive summary
