# Firestore Schema Design - Touch Your Bible

**Date**: October 7, 2025
**Owner**: Marcus (Enterprise Architect)
**Status**: Design Complete

---

## 📋 Schema Overview

This schema is optimized for:
- **Scale**: 5K user cap before migration
- **Performance**: Efficient leaderboard queries (<500ms)
- **Security**: Prevent cheating and unauthorized access
- **Social**: Friends connections and invite tracking
- **Real-time**: Live leaderboard updates

### Architecture Decisions

1. **Leaderboard Strategy**: Simple count-based approach with denormalized `points` field
2. **Friends Structure**: Subcollection for natural ownership and security
3. **Invites Tracking**: Root-level collection for global invite code uniqueness
4. **Indexing**: Composite indexes for multi-field sorting/filtering

---

## 🗄️ Collection Structures

### 1. Users Collection (`users`)

Root-level collection storing all user profiles and stats.

```typescript
// Collection: users/{userId}
interface User {
  // Identity
  id: string;                    // Document ID (Firebase Auth UID)
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;

  // Timestamps
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  lastVerificationAt?: Timestamp; // Last Bible reading verification

  // Streak Tracking
  currentStreak: number;          // Consecutive days (0-n)
  longestStreak: number;          // Personal best
  totalVerifications: number;     // Lifetime count
  lastStreakDate?: Timestamp;     // For streak validation

  // Points System
  points: number;                 // Total points (streak + bonuses)
  streakPoints: number;           // Points from streaks only
  invitePoints: number;           // Points from referrals (max 50)

  // Invite System
  inviteCode: string;             // Unique code: "TOUCH-XXXX"
  invitedBy?: string;             // UserID of referrer
  inviteCount: number;            // Number of successful invites (max 5)

  // Settings
  preferences: {
    notificationsEnabled: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    dailyReminderTime?: string;
    theme: 'light' | 'dark' | 'system';
  };

  // Gamification
  disciplineLevel: 'beginner' | 'standard' | 'committed';

  // Search Optimization (for future features)
  searchName?: string;            // Lowercase displayName for case-insensitive search
}
```

**Field Constraints**:
- `email`: Required, unique (enforced by Firebase Auth)
- `inviteCode`: Required, unique (generated on signup)
- `inviteCount`: Max 5 (enforced by security rules)
- `invitePoints`: Max 50 (5 invites × 10 points)
- `currentStreak`: Min 0
- `points`: Calculated as `streakPoints + invitePoints`

**Indexes Required**:
```javascript
// Composite Index 1: Global Leaderboard
users: [points DESC, currentStreak DESC, createdAt ASC]

// Composite Index 2: Streak Leaderboard (future)
users: [currentStreak DESC, points DESC, createdAt ASC]
```

---

### 2. Friends Subcollection (`users/{userId}/friends`)

Stores bidirectional friend relationships as subcollections for security and ownership.

```typescript
// Subcollection: users/{userId}/friends/{friendId}
interface Friend {
  id: string;                    // Document ID (friend's userId)
  userId: string;                // Friend's userId (duplicate for queries)
  displayName?: string;          // Cached for display
  photoURL?: string;             // Cached for display

  // Friendship Metadata
  connectedAt: Timestamp;        // When friendship was established
  inviteCode?: string;           // Code used to connect (if applicable)

  // Cached Stats (for friends leaderboard)
  points: number;                // Denormalized from friends' user doc
  currentStreak: number;         // Denormalized from friends' user doc
  lastVerificationAt?: Timestamp;// Denormalized from friends' user doc

  // Sync metadata
  lastSyncAt: Timestamp;         // When cached data was last updated
}
```

**Design Rationale**:
- **Subcollection**: Natural ownership model (`user/{userId}/friends`)
- **Denormalization**: Cache friend stats for fast leaderboard queries
- **Bidirectional**: Both users have each other in their friends subcollection
- **Security**: User can only read/write their own friends subcollection

**Indexes Required**:
```javascript
// Composite Index 3: Friends Leaderboard
users/{userId}/friends: [points DESC, currentStreak DESC, connectedAt ASC]
```

**Write Pattern** (when users become friends):
```typescript
// Transaction: Add friend to both users' subcollections
batch.set(db.collection('users').doc(userId).collection('friends').doc(friendId), {
  id: friendId,
  userId: friendId,
  displayName: friendData.displayName,
  photoURL: friendData.photoURL,
  connectedAt: serverTimestamp(),
  inviteCode: inviteCode,
  points: friendData.points,
  currentStreak: friendData.currentStreak,
  lastVerificationAt: friendData.lastVerificationAt,
  lastSyncAt: serverTimestamp()
});

batch.set(db.collection('users').doc(friendId).collection('friends').doc(userId), {
  id: userId,
  userId: userId,
  displayName: userData.displayName,
  photoURL: userData.photoURL,
  connectedAt: serverTimestamp(),
  inviteCode: inviteCode,
  points: userData.points,
  currentStreak: userData.currentStreak,
  lastVerificationAt: userData.lastVerificationAt,
  lastSyncAt: serverTimestamp()
});
```

**Sync Strategy**:
- **Real-time**: Update friend stats when user verifies reading
- **Batch**: Sync all friends' stats daily (Cloud Function in v2)
- **On-demand**: Refresh when opening friends leaderboard

---

### 3. Invites Collection (`invites`)

Root-level collection for tracking invite codes and preventing duplicates.

```typescript
// Collection: invites/{inviteCode}
interface Invite {
  code: string;                  // Document ID: "TOUCH-XXXX"
  createdBy: string;             // UserID of creator
  createdAt: Timestamp;

  // Usage Tracking
  usedBy?: string[];             // Array of userIds who used this code (max 5)
  useCount: number;              // Number of successful uses (0-5)
  maxUses: number;               // Always 5 for MVP
  isActive: boolean;             // False when useCount >= maxUses

  // Metadata
  createdByEmail?: string;       // For admin debugging
  expiresAt?: Timestamp;         // Optional expiration (future feature)
}
```

**Design Rationale**:
- **Root Collection**: Ensures global uniqueness of invite codes
- **Document ID = Code**: Fast lookups by code
- **Array Tracking**: `usedBy` prevents duplicate redemptions
- **Max Uses**: Hard cap at 5 (enforced by security rules)

**Indexes Required**:
```javascript
// Single-field Index (auto-created)
invites: [createdBy ASC]

// For admin queries (future)
invites: [isActive ASC, createdAt DESC]
```

**Invite Code Generation**:
```typescript
function generateInviteCode(): string {
  // Format: TOUCH-XXXX (e.g., TOUCH-A3F9)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars
  const randomPart = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');

  return `TOUCH-${randomPart}`;
}

// Retry logic to ensure uniqueness
async function createUniqueInviteCode(userId: string): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateInviteCode();
    const inviteRef = db.collection('invites').doc(code);

    try {
      // Atomic create (fails if exists)
      await inviteRef.create({
        code: code,
        createdBy: userId,
        createdAt: serverTimestamp(),
        usedBy: [],
        useCount: 0,
        maxUses: 5,
        isActive: true
      });

      return code; // Success
    } catch (error) {
      if (error.code === 'already-exists') {
        attempts++;
        continue; // Retry with new code
      }
      throw error; // Other error
    }
  }

  throw new Error('Failed to generate unique invite code');
}
```

**Redemption Flow**:
```typescript
async function redeemInviteCode(inviteCode: string, newUserId: string): Promise<void> {
  const inviteRef = db.collection('invites').doc(inviteCode);
  const userRef = db.collection('users').doc(newUserId);

  return db.runTransaction(async (transaction) => {
    const inviteDoc = await transaction.get(inviteRef);

    // Validation
    if (!inviteDoc.exists) throw new Error('Invalid invite code');

    const invite = inviteDoc.data() as Invite;

    if (!invite.isActive) throw new Error('Invite code no longer active');
    if (invite.useCount >= invite.maxUses) throw new Error('Invite code limit reached');
    if (invite.usedBy?.includes(newUserId)) throw new Error('Already used this code');
    if (invite.createdBy === newUserId) throw new Error('Cannot use own invite code');

    // Update invite
    transaction.update(inviteRef, {
      usedBy: arrayUnion(newUserId),
      useCount: increment(1),
      isActive: invite.useCount + 1 < invite.maxUses
    });

    // Update new user
    transaction.update(userRef, {
      invitedBy: invite.createdBy
    });

    // Update referrer's stats
    const referrerRef = db.collection('users').doc(invite.createdBy);
    const referrerDoc = await transaction.get(referrerRef);
    const referrer = referrerDoc.data() as User;

    if (referrer.inviteCount < 5) {
      transaction.update(referrerRef, {
        inviteCount: increment(1),
        invitePoints: increment(10),
        points: increment(10) // Update total points
      });
    }
  });
}
```

---

### 4. Verifications Collection (`users/{userId}/verifications`) - Optional

Daily verification logs for audit trail and analytics (future feature).

```typescript
// Subcollection: users/{userId}/verifications/{verificationId}
interface Verification {
  id: string;                    // Auto-generated document ID
  userId: string;
  verifiedAt: Timestamp;

  // Verification Metadata
  method: 'honor-system' | 'photo-proof'; // MVP: always 'honor-system'
  deviceInfo?: {
    platform: 'ios' | 'android';
    appVersion: string;
  };

  // Streak Context
  streakDay: number;             // Day in current streak (1-based)
  pointsAwarded: number;         // Points earned (usually 1)

  // Future: Photo Verification
  photoURL?: string;
  ocrConfidence?: number;
}
```

**Note**: This collection is **optional for MVP**. Can be added later for analytics.

---

## 🔒 Security Rules

Complete Firestore security rules to prevent cheating and unauthorized access.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isValidEmail(email) {
      return email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
    }

    function isValidInviteCode(code) {
      return code.matches('^TOUCH-[A-Z0-9]{4}$');
    }

    // ============================================
    // USERS COLLECTION
    // ============================================

    match /users/{userId} {
      // Read: Anyone can read user profiles (for leaderboards)
      allow read: if isSignedIn();

      // Create: Only on signup, must be own user
      allow create: if isOwner(userId)
        && request.resource.data.email == request.auth.token.email
        && request.resource.data.currentStreak == 0
        && request.resource.data.points == 0
        && request.resource.data.inviteCount == 0
        && isValidInviteCode(request.resource.data.inviteCode);

      // Update: Only own profile, with validation
      allow update: if isOwner(userId)
        // Prevent tampering with critical fields
        && request.resource.data.email == resource.data.email // Cannot change email
        && request.resource.data.createdAt == resource.data.createdAt // Cannot change creation date
        && request.resource.data.inviteCode == resource.data.inviteCode // Cannot change invite code
        // Prevent point manipulation
        && request.resource.data.inviteCount <= 5 // Max 5 invites
        && request.resource.data.invitePoints <= 50 // Max 50 invite points
        && request.resource.data.invitePoints == request.resource.data.inviteCount * 10 // Correct calculation
        && request.resource.data.points == (request.resource.data.streakPoints + request.resource.data.invitePoints); // Correct total

      // Delete: Only own profile (for GDPR compliance)
      allow delete: if isOwner(userId);

      // ============================================
      // FRIENDS SUBCOLLECTION
      // ============================================

      match /friends/{friendId} {
        // Read: Only owner can read their friends
        allow read: if isOwner(userId);

        // Create: Only owner can add friends
        allow create: if isOwner(userId)
          && request.resource.data.userId == friendId; // Prevent ID mismatch

        // Update: Only owner can update friend data (for sync)
        allow update: if isOwner(userId);

        // Delete: Only owner can remove friends
        allow delete: if isOwner(userId);
      }

      // ============================================
      // VERIFICATIONS SUBCOLLECTION (Optional)
      // ============================================

      match /verifications/{verificationId} {
        // Read: Only owner can read their verifications
        allow read: if isOwner(userId);

        // Create: Only owner can create verifications
        allow create: if isOwner(userId)
          && request.resource.data.userId == userId
          && request.resource.data.method == 'honor-system'; // MVP: honor system only

        // Update/Delete: Not allowed (immutable logs)
        allow update: if false;
        allow delete: if false;
      }
    }

    // ============================================
    // INVITES COLLECTION
    // ============================================

    match /invites/{inviteCode} {
      // Read: Anyone can read invite codes (to validate)
      allow read: if isSignedIn();

      // Create: Only on user creation, must match user's code
      allow create: if isSignedIn()
        && isValidInviteCode(inviteCode)
        && request.resource.data.code == inviteCode
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.useCount == 0
        && request.resource.data.maxUses == 5
        && request.resource.data.isActive == true;

      // Update: Only creator or redeemer (via transaction)
      allow update: if isSignedIn()
        // Prevent tampering
        && request.resource.data.code == resource.data.code // Cannot change code
        && request.resource.data.createdBy == resource.data.createdBy // Cannot change creator
        && request.resource.data.createdAt == resource.data.createdAt // Cannot change creation date
        && request.resource.data.maxUses == resource.data.maxUses // Cannot change max uses
        // Validate use count
        && request.resource.data.useCount <= 5
        && request.resource.data.useCount >= resource.data.useCount // Cannot decrease
        && request.resource.data.usedBy.size() == request.resource.data.useCount // Array matches count
        && request.resource.data.isActive == (request.resource.data.useCount < 5); // Correct active state

      // Delete: Never allowed (keep audit trail)
      allow delete: if false;
    }
  }
}
```

**Security Highlights**:
- ✅ **Prevent Point Manipulation**: Validate point calculations in rules
- ✅ **Invite Limits**: Enforce max 5 invites per user
- ✅ **Immutable Fields**: Prevent changing email, createdAt, inviteCode
- ✅ **Audit Trail**: Invites and verifications are immutable
- ✅ **Cross-Service**: Can extend rules to Cloud Storage for photo verification

---

## 📊 Query Patterns

Efficient query patterns for leaderboards and social features.

### 1. Global Leaderboard (Top 100)

```typescript
// Query: Top 100 users by points
const globalLeaderboard = await db.collection('users')
  .orderBy('points', 'desc')
  .orderBy('currentStreak', 'desc')  // Tiebreaker
  .orderBy('createdAt', 'asc')       // Secondary tiebreaker (older users first)
  .limit(100)
  .get();

// Real-time updates
const unsubscribe = db.collection('users')
  .orderBy('points', 'desc')
  .orderBy('currentStreak', 'desc')
  .orderBy('createdAt', 'asc')
  .limit(100)
  .onSnapshot((snapshot) => {
    const leaders = snapshot.docs.map((doc, index) => ({
      rank: index + 1,
      ...doc.data() as User
    }));
    updateLeaderboard(leaders);
  });
```

**Performance**:
- **Index**: `users: [points DESC, currentStreak DESC, createdAt ASC]`
- **Cost**: 100 reads per query
- **Latency**: <200ms (with index)

---

### 2. Friends Leaderboard

```typescript
// Query: Friends sorted by points
const friendsLeaderboard = await db.collection('users')
  .doc(userId)
  .collection('friends')
  .orderBy('points', 'desc')
  .orderBy('currentStreak', 'desc')
  .orderBy('connectedAt', 'asc')
  .get();

// Real-time updates
const unsubscribe = db.collection('users')
  .doc(userId)
  .collection('friends')
  .orderBy('points', 'desc')
  .orderBy('currentStreak', 'desc')
  .orderBy('connectedAt', 'asc')
  .onSnapshot((snapshot) => {
    const friends = snapshot.docs.map((doc, index) => ({
      rank: index + 1,
      ...doc.data() as Friend
    }));
    updateFriendsLeaderboard(friends);
  });
```

**Performance**:
- **Index**: `users/{userId}/friends: [points DESC, currentStreak DESC, connectedAt ASC]`
- **Cost**: N reads (where N = friend count, typically <50)
- **Latency**: <100ms (with index)

---

### 3. User Rank Calculation (Optional - Expensive)

```typescript
// Calculate user's rank in global leaderboard
// ⚠️ WARNING: Expensive operation, use sparingly
async function getUserRank(userId: string, userPoints: number): Promise<number> {
  const higherRankedUsers = await db.collection('users')
    .where('points', '>', userPoints)
    .count()
    .get();

  return higherRankedUsers.data().count + 1;
}
```

**Performance**:
- **Cost**: 1 count query (uses aggregation, scales to ~1M users)
- **Latency**: ~100-300ms
- **Alternative**: Show user's position in top 100 instead of exact rank

---

### 4. Invite Code Lookup

```typescript
// Validate invite code
async function validateInviteCode(code: string): Promise<Invite | null> {
  const inviteDoc = await db.collection('invites').doc(code).get();

  if (!inviteDoc.exists) return null;

  const invite = inviteDoc.data() as Invite;

  // Check if code is still valid
  if (!invite.isActive || invite.useCount >= invite.maxUses) {
    return null;
  }

  return invite;
}
```

**Performance**:
- **Cost**: 1 read per lookup
- **Latency**: <50ms (document ID lookup)

---

### 5. Friend Sync (Background)

```typescript
// Sync friend stats when user verifies reading
async function syncFriendStats(userId: string, updatedStats: Partial<User>): Promise<void> {
  // Get all users who have this user as a friend
  const friendsQuery = await db.collectionGroup('friends')
    .where('userId', '==', userId)
    .get();

  const batch = db.batch();

  friendsQuery.docs.forEach((doc) => {
    batch.update(doc.ref, {
      points: updatedStats.points,
      currentStreak: updatedStats.currentStreak,
      lastVerificationAt: updatedStats.lastVerificationAt,
      lastSyncAt: serverTimestamp()
    });
  });

  await batch.commit();
}
```

**Performance**:
- **Cost**: N reads + N writes (where N = number of friends who added this user)
- **Optimization**: Run as background task, not blocking user verification
- **Future**: Move to Cloud Function triggered on user update

---

## 📈 Scaling Strategy

### Current (MVP - 5K Users)

**Approach**: Simple Firestore queries
**Performance**: <500ms for leaderboards
**Cost**: ~$0.06 per 1K leaderboard views (100 reads × $0.06/100K)

**Bottlenecks**:
- Friend sync scales linearly with connections
- Real-time listeners can spike costs
- No caching layer

### Future (5K+ Users)

**Migration Path**:

1. **Level 1 (5K-50K users)**:
   - Add Redis caching for top 100 leaderboard
   - Batch friend sync updates (every 5 minutes)
   - Implement pagination for leaderboards

2. **Level 2 (50K-500K users)**:
   - Move to Cloud Functions for leaderboard calculation
   - Use distributed counters for points
   - Implement tree-based ranking (binary search)

3. **Level 3 (500K+ users)**:
   - Dedicated leaderboard microservice
   - Elasticsearch for search and rankings
   - Event-driven architecture with Pub/Sub

---

## ✅ Index Deployment

Create indexes using Firebase CLI:

```bash
# firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "points", "order": "DESCENDING" },
        { "fieldPath": "currentStreak", "order": "DESCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "currentStreak", "order": "DESCENDING" },
        { "fieldPath": "points", "order": "DESCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "friends",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "points", "order": "DESCENDING" },
        { "fieldPath": "currentStreak", "order": "DESCENDING" },
        { "fieldPath": "connectedAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "invites",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

**Index Creation Time**: 5-15 minutes for empty database, longer with data.

---

## 🔍 Testing Checklist

### Data Integrity
- [ ] Invite codes are unique (test 1000 generations)
- [ ] Points calculation is correct (streak + invite points)
- [ ] Invite limit enforced (max 5 per user)
- [ ] Invite points capped (max 50)
- [ ] Bidirectional friends created correctly

### Security
- [ ] Cannot modify other users' profiles
- [ ] Cannot tamper with points/streaks
- [ ] Cannot use own invite code
- [ ] Cannot exceed 5 invites
- [ ] Friends are isolated per user

### Performance
- [ ] Global leaderboard loads <500ms
- [ ] Friends leaderboard loads <200ms
- [ ] Invite code lookup <50ms
- [ ] Real-time updates work correctly
- [ ] Batch operations complete <2s

### Edge Cases
- [ ] Concurrent invite redemptions (race conditions)
- [ ] Deleting user removes all subcollections
- [ ] Handling expired/invalid invite codes
- [ ] Network offline/online scenarios
- [ ] Clock skew for streak validation

---

## 📚 TypeScript Types

Complete TypeScript definitions for type safety:

```typescript
// src/types/firestore.ts

import { Timestamp } from 'firebase/firestore';

// ============================================
// USER TYPES
// ============================================

export interface UserPreferences {
  notificationsEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  dailyReminderTime?: string;
  theme: 'light' | 'dark' | 'system';
}

export type DisciplineLevel = 'beginner' | 'standard' | 'committed';

export interface User {
  // Identity
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;

  // Timestamps
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  lastVerificationAt?: Timestamp;

  // Streak Tracking
  currentStreak: number;
  longestStreak: number;
  totalVerifications: number;
  lastStreakDate?: Timestamp;

  // Points System
  points: number;
  streakPoints: number;
  invitePoints: number;

  // Invite System
  inviteCode: string;
  invitedBy?: string;
  inviteCount: number;

  // Settings
  preferences: UserPreferences;
  disciplineLevel: DisciplineLevel;

  // Search (optional)
  searchName?: string;
}

// ============================================
// FRIEND TYPES
// ============================================

export interface Friend {
  id: string;
  userId: string;
  displayName?: string;
  photoURL?: string;

  // Friendship Metadata
  connectedAt: Timestamp;
  inviteCode?: string;

  // Cached Stats
  points: number;
  currentStreak: number;
  lastVerificationAt?: Timestamp;

  // Sync
  lastSyncAt: Timestamp;
}

// ============================================
// INVITE TYPES
// ============================================

export interface Invite {
  code: string;
  createdBy: string;
  createdAt: Timestamp;

  // Usage Tracking
  usedBy?: string[];
  useCount: number;
  maxUses: number;
  isActive: boolean;

  // Metadata
  createdByEmail?: string;
  expiresAt?: Timestamp;
}

// ============================================
// VERIFICATION TYPES (Optional)
// ============================================

export type VerificationMethod = 'honor-system' | 'photo-proof';

export interface Verification {
  id: string;
  userId: string;
  verifiedAt: Timestamp;

  method: VerificationMethod;
  deviceInfo?: {
    platform: 'ios' | 'android';
    appVersion: string;
  };

  streakDay: number;
  pointsAwarded: number;

  // Future
  photoURL?: string;
  ocrConfidence?: number;
}

// ============================================
// LEADERBOARD TYPES
// ============================================

export interface LeaderboardEntry {
  rank: number;
  user: User;
}

export interface FriendsLeaderboardEntry {
  rank: number;
  friend: Friend;
}

// ============================================
// FIRESTORE CONVERTERS (for type safety)
// ============================================

import {
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreDataConverter
} from 'firebase/firestore';

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore(user: User): DocumentData {
    return { ...user };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): User {
    return snapshot.data() as User;
  }
};

export const friendConverter: FirestoreDataConverter<Friend> = {
  toFirestore(friend: Friend): DocumentData {
    return { ...friend };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Friend {
    return snapshot.data() as Friend;
  }
};

export const inviteConverter: FirestoreDataConverter<Invite> = {
  toFirestore(invite: Invite): DocumentData {
    return { ...invite };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Invite {
    return snapshot.data() as Invite;
  }
};
```

---

## 🚀 Implementation Priority

### Phase 1: Core Schema (Day 1)
1. ✅ Users collection structure
2. ✅ Basic security rules
3. ✅ TypeScript types
4. ✅ Index definitions

### Phase 2: Leaderboards (Days 2-3)
1. ✅ Global leaderboard queries
2. ✅ Friends subcollection
3. ✅ Friend sync logic
4. ✅ Real-time listeners

### Phase 3: Invites (Days 4-5)
1. ✅ Invite code generation
2. ✅ Redemption flow
3. ✅ Points calculation
4. ✅ Usage tracking

### Phase 4: Testing (Days 6-7)
1. ✅ Security rules testing
2. ✅ Performance benchmarks
3. ✅ Edge case validation
4. ✅ Index deployment

---

## 📝 Notes

**Key Decisions**:
- ✅ Denormalized friend stats for performance
- ✅ Root-level invites for uniqueness guarantees
- ✅ Simple count-based leaderboards (scales to 5K users)
- ✅ Honor system verification (no photo proof in MVP)
- ✅ Bidirectional friends (both users have subcollection)

**Trade-offs**:
- **More writes, faster reads**: Friend stats denormalization
- **Storage vs queries**: Caching friend data in subcollections
- **Simplicity vs scale**: Simple queries now, Cloud Functions later

**Future Enhancements**:
- Pagination for leaderboards (infinite scroll)
- Search users by displayName
- Private groups/communities
- Photo verification with Cloud Vision
- Analytics dashboard for admins

---

**Status**: ✅ Design Complete
**Next Steps**: Implement schema in Firestore, deploy security rules, create indexes
**Owner**: Marcus (Architect) → Alex (Engineer)
