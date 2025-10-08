# Firestore Quick Start Guide

## 🚀 Initial Setup

### 1. Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### 2. Deploy Indexes
```bash
firebase deploy --only firestore:indexes
```

Wait 5-15 minutes for indexes to build.

### 3. Verify Index Status
```bash
firebase firestore:indexes
```

---

## 📝 Common Operations

### Create User with Invite Code

```typescript
import { createUniqueInviteCode } from '@/services/invites';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

async function createNewUser(userId: string, email: string) {
  // Generate unique invite code
  const inviteCode = await createUniqueInviteCode(userId, email);

  // Create user document
  await setDoc(doc(db, 'users', userId), {
    email,
    emailVerified: false,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    currentStreak: 0,
    longestStreak: 0,
    totalVerifications: 0,
    points: 0,
    streakPoints: 0,
    invitePoints: 0,
    inviteCode,
    inviteCount: 0,
    preferences: {
      notificationsEnabled: true,
      theme: 'system'
    },
    disciplineLevel: 'beginner'
  });
}
```

### Redeem Invite Code

```typescript
import { redeemInviteCode } from '@/services/invites';

async function useInviteCode(code: string, userId: string) {
  try {
    await redeemInviteCode(code, userId);
    console.log('Invite code redeemed successfully');
  } catch (error) {
    console.error('Failed to redeem invite:', error.message);
  }
}
```

### Connect Friends

```typescript
import { connectFriends } from '@/services/friends';

async function addFriend(userId: string, friendId: string, inviteCode?: string) {
  try {
    await connectFriends(userId, friendId, inviteCode);
    console.log('Friends connected successfully');
  } catch (error) {
    console.error('Failed to connect friends:', error.message);
  }
}
```

### Display Global Leaderboard

```typescript
import { subscribeToGlobalLeaderboard } from '@/services/leaderboard';

function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToGlobalLeaderboard(
      100, // Top 100
      (data) => setLeaderboard(data),
      (error) => console.error('Leaderboard error:', error)
    );

    return unsubscribe;
  }, []);

  return (
    <FlatList
      data={leaderboard}
      renderItem={({ item }) => (
        <View>
          <Text>#{item.rank}</Text>
          <Text>{item.user.displayName}</Text>
          <Text>{item.user.points} pts</Text>
          <Text>{item.user.currentStreak} day streak</Text>
        </View>
      )}
    />
  );
}
```

### Display Friends Leaderboard

```typescript
import { subscribeToFriendsLeaderboard } from '@/services/leaderboard';

function FriendsLeaderboardScreen({ userId }: { userId: string }) {
  const [leaderboard, setLeaderboard] = useState<FriendsLeaderboardEntry[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToFriendsLeaderboard(
      userId,
      (data) => setLeaderboard(data),
      (error) => console.error('Friends leaderboard error:', error)
    );

    return unsubscribe;
  }, [userId]);

  return (
    <FlatList
      data={leaderboard}
      renderItem={({ item }) => (
        <View>
          <Text>#{item.rank}</Text>
          <Text>{item.friend.displayName}</Text>
          <Text>{item.friend.points} pts</Text>
          <Text>{item.friend.currentStreak} day streak</Text>
        </View>
      )}
    />
  );
}
```

### Update Streak and Sync Friends

```typescript
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { syncFriendStats } from '@/services/friends';
import { db } from '@/config/firebase';

async function recordDailyVerification(userId: string, currentStreak: number) {
  const newStreak = currentStreak + 1;
  const userRef = doc(db, 'users', userId);

  // Update user stats
  await updateDoc(userRef, {
    currentStreak: newStreak,
    longestStreak: newStreak, // Update if new record
    totalVerifications: increment(1),
    streakPoints: newStreak, // Points = streak
    points: increment(1), // Total points
    lastVerificationAt: serverTimestamp(),
    lastStreakDate: serverTimestamp()
  });

  // Sync stats to all friends (background)
  syncFriendStats(userId, {
    points: newStreak, // Will be calculated server-side
    currentStreak: newStreak,
    lastVerificationAt: serverTimestamp()
  }).catch((error) => {
    console.error('Friend sync failed:', error);
    // Non-blocking, can retry later
  });
}
```

### Refresh Friend Stats

```typescript
import { refreshAllFriendStats } from '@/services/friends';

async function refreshFriends(userId: string) {
  try {
    await refreshAllFriendStats(userId);
    console.log('Friend stats refreshed');
  } catch (error) {
    console.error('Failed to refresh:', error);
  }
}

// Call when opening friends leaderboard
useEffect(() => {
  refreshFriends(userId);
}, [userId]);
```

---

## ⚠️ Important Notes

### Security Rules Validation

**Points Calculation**:
- `invitePoints` must equal `inviteCount × 10`
- `points` must equal `streakPoints + invitePoints`
- Rules enforce these calculations automatically

**Invite Limits**:
- Max 5 invites per user (enforced by rules)
- Max 50 invite points (enforced by rules)
- Cannot use own invite code (enforced by rules)

### Performance Considerations

**Real-time Listeners**:
- Global leaderboard: 100 reads per update
- Friends leaderboard: N reads (where N = friend count)
- Use wisely, unsubscribe when not needed

**Friend Sync**:
- Runs async, don't block user verification
- Can be batched or delayed
- Consider Cloud Function for v2 (automatic triggers)

**Indexing**:
- All multi-field queries require indexes
- Firestore will show error links if index missing
- Deploy indexes before deploying app

### Testing Checklist

- [ ] Create user with unique invite code
- [ ] Redeem invite code (validate bonus points)
- [ ] Connect friends (bidirectional)
- [ ] View global leaderboard (sorted correctly)
- [ ] View friends leaderboard (sorted correctly)
- [ ] Update streak (sync to friends)
- [ ] Test max invite limit (5 invites)
- [ ] Test security rules (cannot cheat points)

---

## 🔧 Debugging

### Check Index Status
```bash
firebase firestore:indexes
```

### Test Security Rules Locally
```bash
firebase emulators:start --only firestore
```

### View Firestore Data
```bash
firebase console:firestore
```

### Monitor Query Performance
```typescript
import { measureLeaderboardPerformance } from '@/services/leaderboard';

const { durationMs, resultCount } = await measureLeaderboardPerformance('global');
console.log(`Query took ${durationMs}ms, returned ${resultCount} results`);
```

---

## 📚 Reference

- **Full Schema**: [FIRESTORE_SCHEMA.md](./FIRESTORE_SCHEMA.md)
- **Security Rules**: [firestore.rules](../firestore.rules)
- **Indexes**: [firestore.indexes.json](../firestore.indexes.json)
- **Types**: [src/types/firestore.ts](../src/types/firestore.ts)
- **Services**:
  - [invites.ts](../src/services/invites.ts)
  - [friends.ts](../src/services/friends.ts)
  - [leaderboard.ts](../src/services/leaderboard.ts)

---

## 🚨 Common Errors

### "Missing or insufficient permissions"
- Check if user is authenticated
- Verify security rules are deployed
- Ensure document ownership (userId matches auth.uid)

### "Query requires an index"
- Deploy indexes: `firebase deploy --only firestore:indexes`
- Wait 5-15 minutes for index to build
- Check index status: `firebase firestore:indexes`

### "Invite code already exists"
- Retry logic handles this automatically
- Check `createUniqueInviteCode()` function
- Verify collision rate (should be <0.1%)

### "Points calculation mismatch"
- Security rules enforce correct calculation
- Ensure `points = streakPoints + invitePoints`
- Check that `invitePoints = inviteCount × 10`

---

**Quick Start Complete!** 🎉

Next: Implement UI components for leaderboards and invite sharing.
