# Schema Migration Guide

## Overview

This guide helps migrate from the existing user schema to the new Firestore schema with leaderboards and social features.

---

## Current Schema vs. New Schema

### Existing User Schema
```typescript
// src/types/user.ts (current)
interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: UserPreferences;
  currentStreak: number;
  longestStreak: number;
  totalVerifications: number;
  disciplineLevel: 'beginner' | 'standard' | 'committed';
}
```

### New Schema Additions
```typescript
// src/types/firestore.ts (new)
interface User {
  // ... existing fields (with Timestamp instead of Date)

  // NEW: Streak tracking
  lastStreakDate?: Timestamp;        // For streak validation
  lastVerificationAt?: Timestamp;    // Last reading timestamp

  // NEW: Points system
  points: number;                    // Total points
  streakPoints: number;              // Points from streaks
  invitePoints: number;              // Points from referrals (max 50)

  // NEW: Invite system
  inviteCode: string;                // Unique: "TOUCH-XXXX"
  invitedBy?: string;                // Referrer's userId
  inviteCount: number;               // Successful invites (max 5)

  // NEW: Search optimization
  searchName?: string;               // Lowercase displayName
}
```

---

## Migration Steps

### Step 1: Update Existing Users

Create a migration script to add new fields to existing users:

```typescript
// scripts/migrateUsers.ts
import { db } from '../src/config/firebase';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { createUniqueInviteCode } from '../src/services/invites';

async function migrateExistingUsers() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  console.log(`Migrating ${snapshot.size} users...`);

  // Process in batches of 500 (Firestore limit)
  const batchSize = 500;
  let batch = writeBatch(db);
  let count = 0;

  for (const doc of snapshot.docs) {
    const userId = doc.id;
    const userData = doc.data();

    // Generate unique invite code
    let inviteCode: string;
    try {
      inviteCode = await createUniqueInviteCode(userId, userData.email);
    } catch (error) {
      console.error(`Failed to create invite code for user ${userId}:`, error);
      continue;
    }

    // Calculate initial points from existing streak
    const streakPoints = userData.currentStreak || 0;

    // Add new fields
    batch.update(doc.ref, {
      // Streak tracking
      lastStreakDate: userData.lastLoginAt || null,
      lastVerificationAt: null,

      // Points system
      points: streakPoints,
      streakPoints: streakPoints,
      invitePoints: 0,

      // Invite system
      inviteCode: inviteCode,
      inviteCount: 0,

      // Search optimization
      searchName: userData.displayName?.toLowerCase() || null
    });

    count++;

    // Commit batch every 500 operations
    if (count % batchSize === 0) {
      await batch.commit();
      console.log(`Migrated ${count} users...`);
      batch = writeBatch(db);
    }
  }

  // Commit remaining operations
  if (count % batchSize !== 0) {
    await batch.commit();
  }

  console.log(`Migration complete! Migrated ${count} users.`);
}

// Run migration
migrateExistingUsers()
  .then(() => console.log('Success'))
  .catch((error) => console.error('Migration failed:', error));
```

### Step 2: Update Firestore Service

Replace the existing firestore service with the new schema:

```typescript
// src/services/firestore.ts (updated)
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { User, UserPreferences } from '../types/firestore';
import { createUniqueInviteCode } from './invites';

export async function createUserProfile(userId: string, email: string): Promise<void> {
  // Generate unique invite code
  const inviteCode = await createUniqueInviteCode(userId, email);

  const defaultPreferences: UserPreferences = {
    notificationsEnabled: true,
    theme: 'system',
  };

  const userProfile: Omit<User, 'id'> = {
    email,
    emailVerified: false,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),

    // Streak tracking
    currentStreak: 0,
    longestStreak: 0,
    totalVerifications: 0,

    // Points system
    points: 0,
    streakPoints: 0,
    invitePoints: 0,

    // Invite system
    inviteCode,
    inviteCount: 0,

    // Settings
    preferences: defaultPreferences,
    disciplineLevel: 'beginner',

    // Search
    searchName: null
  };

  await setDoc(doc(db, 'users', userId), userProfile);
}

export async function getUserProfile(userId: string): Promise<User | null> {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...docSnap.data()
  } as User;
}

// ... other functions
```

### Step 3: Deploy New Schema

1. **Deploy Security Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Deploy Indexes**:
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **Run Migration Script**:
   ```bash
   npx ts-node scripts/migrateUsers.ts
   ```

4. **Verify Migration**:
   ```bash
   # Check if all users have invite codes
   # Check if points are calculated correctly
   # Verify indexes are active
   ```

---

## Backward Compatibility

### Phase 1: Dual Support (2 weeks)

Support both old and new schemas during migration:

```typescript
// Helper to handle both Date and Timestamp
function toDate(value: Date | Timestamp | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  return value.toDate();
}

// Safe field access
function getInviteCode(user: any): string | null {
  return user.inviteCode || null;
}

function getPoints(user: any): number {
  return user.points || user.currentStreak || 0;
}
```

### Phase 2: Full Migration (After 2 weeks)

Remove backward compatibility code and enforce new schema.

---

## Data Validation

### Pre-Migration Checks

```typescript
async function validateBeforeMigration() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  const issues: string[] = [];

  snapshot.docs.forEach((doc) => {
    const data = doc.data();

    // Check required fields
    if (!data.email) issues.push(`User ${doc.id} missing email`);
    if (!data.createdAt) issues.push(`User ${doc.id} missing createdAt`);
    if (typeof data.currentStreak !== 'number') {
      issues.push(`User ${doc.id} has invalid currentStreak`);
    }
  });

  if (issues.length > 0) {
    console.error('Validation failed:', issues);
    throw new Error(`Found ${issues.length} data issues`);
  }

  console.log('Pre-migration validation passed!');
}
```

### Post-Migration Checks

```typescript
async function validateAfterMigration() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  const issues: string[] = [];

  snapshot.docs.forEach((doc) => {
    const data = doc.data();

    // Check new required fields
    if (!data.inviteCode) issues.push(`User ${doc.id} missing inviteCode`);
    if (typeof data.points !== 'number') {
      issues.push(`User ${doc.id} has invalid points`);
    }
    if (data.inviteCount > 5) {
      issues.push(`User ${doc.id} has inviteCount > 5`);
    }
    if (data.invitePoints !== data.inviteCount * 10) {
      issues.push(`User ${doc.id} has incorrect invitePoints calculation`);
    }
  });

  if (issues.length > 0) {
    console.error('Post-migration validation failed:', issues);
    throw new Error(`Found ${issues.length} data issues`);
  }

  console.log('Post-migration validation passed!');
}
```

---

## Rollback Plan

If migration fails, rollback using these steps:

### 1. Revert Security Rules
```bash
git checkout HEAD~1 firestore.rules
firebase deploy --only firestore:rules
```

### 2. Remove New Fields (Optional)
```typescript
async function rollbackMigration() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  const batch = writeBatch(db);
  let count = 0;

  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, {
      lastStreakDate: deleteField(),
      lastVerificationAt: deleteField(),
      points: deleteField(),
      streakPoints: deleteField(),
      invitePoints: deleteField(),
      inviteCode: deleteField(),
      inviteCount: deleteField(),
      invitedBy: deleteField(),
      searchName: deleteField()
    });

    count++;
  });

  await batch.commit();
  console.log(`Rolled back ${count} users`);
}
```

### 3. Delete Invites Collection
```bash
# Use Firebase Console or script
firebase firestore:delete invites --recursive --force
```

---

## Testing Migration

### Local Testing with Emulator

1. **Start Firestore Emulator**:
   ```bash
   firebase emulators:start --only firestore
   ```

2. **Point app to emulator**:
   ```typescript
   import { connectFirestoreEmulator } from 'firebase/firestore';

   if (__DEV__) {
     connectFirestoreEmulator(db, 'localhost', 8080);
   }
   ```

3. **Run migration script against emulator**:
   ```bash
   FIRESTORE_EMULATOR_HOST="localhost:8080" npx ts-node scripts/migrateUsers.ts
   ```

4. **Verify data in emulator UI**:
   ```
   http://localhost:4000/firestore
   ```

---

## Migration Timeline

### Week 1: Preparation
- [ ] Review new schema documentation
- [ ] Create migration scripts
- [ ] Test migration on emulator
- [ ] Deploy indexes (start building early)
- [ ] Update TypeScript types

### Week 2: Staged Rollout
- [ ] Deploy security rules (permissive mode)
- [ ] Run migration script on production
- [ ] Validate migrated data
- [ ] Deploy app with new features
- [ ] Monitor for issues

### Week 3: Cleanup
- [ ] Remove backward compatibility code
- [ ] Tighten security rules
- [ ] Delete old unused fields (optional)
- [ ] Update documentation

---

## Monitoring

### Key Metrics to Track

1. **Migration Success Rate**:
   - Users with invite codes: 100%
   - Users with valid points: 100%
   - Failed migrations: <1%

2. **Performance**:
   - Leaderboard query time: <500ms
   - Friends query time: <200ms
   - Invite code lookup: <50ms

3. **Data Integrity**:
   - Points calculation errors: 0
   - Duplicate invite codes: 0
   - Orphaned friend documents: 0

### Alerts to Set Up

- Migration script failures
- Security rule violations
- Index creation errors
- Query performance degradation
- Data validation failures

---

## FAQs

### Q: Will migration cause downtime?
A: No, migration is backward compatible. Old and new schemas work simultaneously during transition.

### Q: What happens to existing streaks?
A: Existing streaks are preserved. `currentStreak` is converted to `streakPoints` during migration.

### Q: How long does migration take?
A: ~1-2 seconds per 1000 users. For 5K users, expect ~5-10 seconds.

### Q: Can I rollback if something goes wrong?
A: Yes, follow the rollback plan above. Data is not deleted, only fields are added.

### Q: Will users lose their data?
A: No, all existing data is preserved. Only new fields are added with default values.

---

**Migration Checklist**:

- [ ] Review schema documentation
- [ ] Test on emulator
- [ ] Deploy indexes (wait for build)
- [ ] Deploy security rules
- [ ] Run validation checks
- [ ] Execute migration script
- [ ] Verify migrated data
- [ ] Deploy updated app
- [ ] Monitor metrics
- [ ] Remove backward compatibility (after 2 weeks)

**Status**: Ready for implementation
**Owner**: Alex (Engineer)
**Timeline**: 2 weeks (staged rollout)
