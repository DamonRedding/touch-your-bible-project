// Friends Service - Touch Your Bible
// Handles friend connections, sync, and management

import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
  query,
  collectionGroup,
  where,
  Timestamp
} from 'firebase/firestore';
import type { User, Friend } from '../types/firestore';

const USERS_COLLECTION = 'users';
const FRIENDS_SUBCOLLECTION = 'friends';

// ============================================
// FRIEND CONNECTION
// ============================================

/**
 * Connect two users as friends (bidirectional)
 * Creates friend documents in both users' subcollections
 */
export async function connectFriends(
  userId: string,
  friendId: string,
  inviteCode?: string
): Promise<void> {
  // Validation
  if (userId === friendId) {
    throw new Error('Cannot add yourself as a friend');
  }

  // Get both user documents
  const userRef = doc(db, USERS_COLLECTION, userId);
  const friendRef = doc(db, USERS_COLLECTION, friendId);

  const [userDoc, friendDoc] = await Promise.all([
    getDoc(userRef),
    getDoc(friendRef)
  ]);

  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  if (!friendDoc.exists()) {
    throw new Error('Friend not found');
  }

  const userData = userDoc.data() as User;
  const friendData = friendDoc.data() as User;

  // Check if already friends
  const existingFriendDoc = await getDoc(
    doc(db, USERS_COLLECTION, userId, FRIENDS_SUBCOLLECTION, friendId)
  );

  if (existingFriendDoc.exists()) {
    throw new Error('Already friends');
  }

  // Create bidirectional friendship using batch write
  const batch = writeBatch(db);

  // Add friend to user's friends subcollection
  const userFriendRef = doc(
    db,
    USERS_COLLECTION,
    userId,
    FRIENDS_SUBCOLLECTION,
    friendId
  );

  batch.set(userFriendRef, {
    id: friendId,
    userId: friendId,
    displayName: friendData.displayName || null,
    photoURL: friendData.photoURL || null,
    connectedAt: serverTimestamp(),
    inviteCode: inviteCode || null,
    points: friendData.points,
    currentStreak: friendData.currentStreak,
    lastVerificationAt: friendData.lastVerificationAt || null,
    lastSyncAt: serverTimestamp()
  } as Omit<Friend, 'connectedAt' | 'lastSyncAt'> & {
    connectedAt: ReturnType<typeof serverTimestamp>;
    lastSyncAt: ReturnType<typeof serverTimestamp>;
  });

  // Add user to friend's friends subcollection
  const friendUserRef = doc(
    db,
    USERS_COLLECTION,
    friendId,
    FRIENDS_SUBCOLLECTION,
    userId
  );

  batch.set(friendUserRef, {
    id: userId,
    userId: userId,
    displayName: userData.displayName || null,
    photoURL: userData.photoURL || null,
    connectedAt: serverTimestamp(),
    inviteCode: inviteCode || null,
    points: userData.points,
    currentStreak: userData.currentStreak,
    lastVerificationAt: userData.lastVerificationAt || null,
    lastSyncAt: serverTimestamp()
  } as Omit<Friend, 'connectedAt' | 'lastSyncAt'> & {
    connectedAt: ReturnType<typeof serverTimestamp>;
    lastSyncAt: ReturnType<typeof serverTimestamp>;
  });

  await batch.commit();
}

// ============================================
// FRIEND MANAGEMENT
// ============================================

/**
 * Remove friend connection (bidirectional)
 */
export async function removeFriend(userId: string, friendId: string): Promise<void> {
  const batch = writeBatch(db);

  // Remove from user's friends
  const userFriendRef = doc(
    db,
    USERS_COLLECTION,
    userId,
    FRIENDS_SUBCOLLECTION,
    friendId
  );
  batch.delete(userFriendRef);

  // Remove from friend's friends
  const friendUserRef = doc(
    db,
    USERS_COLLECTION,
    friendId,
    FRIENDS_SUBCOLLECTION,
    userId
  );
  batch.delete(friendUserRef);

  await batch.commit();
}

/**
 * Get all friends for a user
 */
export async function getUserFriends(userId: string): Promise<Friend[]> {
  const friendsRef = collection(db, USERS_COLLECTION, userId, FRIENDS_SUBCOLLECTION);
  const snapshot = await getDocs(friendsRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  })) as Friend[];
}

/**
 * Get friend count for a user
 */
export async function getFriendCount(userId: string): Promise<number> {
  const friendsRef = collection(db, USERS_COLLECTION, userId, FRIENDS_SUBCOLLECTION);
  const snapshot = await getDocs(friendsRef);
  return snapshot.size;
}

/**
 * Check if two users are friends
 */
export async function areFriends(userId: string, friendId: string): Promise<boolean> {
  const friendRef = doc(
    db,
    USERS_COLLECTION,
    userId,
    FRIENDS_SUBCOLLECTION,
    friendId
  );
  const friendDoc = await getDoc(friendRef);
  return friendDoc.exists();
}

// ============================================
// FRIEND STATS SYNC
// ============================================

/**
 * Sync friend stats when user updates their stats
 * Updates cached stats in all friends' subcollections
 */
export async function syncFriendStats(
  userId: string,
  updatedStats: {
    points?: number;
    currentStreak?: number;
    lastVerificationAt?: Timestamp;
    displayName?: string;
    photoURL?: string;
  }
): Promise<void> {
  // Get all users who have this user as a friend
  const friendsQuery = query(
    collectionGroup(db, FRIENDS_SUBCOLLECTION),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(friendsQuery);

  if (snapshot.empty) {
    return; // No friends to sync
  }

  // Batch update all friend references
  const batch = writeBatch(db);
  const syncData = {
    ...updatedStats,
    lastSyncAt: serverTimestamp()
  };

  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, syncData);
  });

  await batch.commit();
}

/**
 * Manually refresh friend stats from source user
 * Useful when cached data becomes stale
 */
export async function refreshFriendStats(
  userId: string,
  friendId: string
): Promise<void> {
  // Get friend's current stats
  const friendUserRef = doc(db, USERS_COLLECTION, friendId);
  const friendUserDoc = await getDoc(friendUserRef);

  if (!friendUserDoc.exists()) {
    throw new Error('Friend user not found');
  }

  const friendData = friendUserDoc.data() as User;

  // Update cached stats in user's friends subcollection
  const userFriendRef = doc(
    db,
    USERS_COLLECTION,
    userId,
    FRIENDS_SUBCOLLECTION,
    friendId
  );

  await getDoc(userFriendRef); // Ensure friend document exists

  const batch = writeBatch(db);

  batch.update(userFriendRef, {
    displayName: friendData.displayName || null,
    photoURL: friendData.photoURL || null,
    points: friendData.points,
    currentStreak: friendData.currentStreak,
    lastVerificationAt: friendData.lastVerificationAt || null,
    lastSyncAt: serverTimestamp()
  });

  await batch.commit();
}

/**
 * Refresh all friends' stats for a user
 * Should be called periodically or on friends leaderboard load
 */
export async function refreshAllFriendStats(userId: string): Promise<void> {
  const friends = await getUserFriends(userId);

  if (friends.length === 0) {
    return;
  }

  // Get all friend user documents
  const friendUserRefs = friends.map((friend) =>
    doc(db, USERS_COLLECTION, friend.userId)
  );

  const friendUserDocs = await Promise.all(
    friendUserRefs.map((ref) => getDoc(ref))
  );

  // Batch update all friend stats
  const batch = writeBatch(db);

  friendUserDocs.forEach((friendUserDoc, index) => {
    if (!friendUserDoc.exists()) {
      return; // Skip deleted users
    }

    const friendData = friendUserDoc.data() as User;
    const friendRef = doc(
      db,
      USERS_COLLECTION,
      userId,
      FRIENDS_SUBCOLLECTION,
      friends[index].userId
    );

    batch.update(friendRef, {
      displayName: friendData.displayName || null,
      photoURL: friendData.photoURL || null,
      points: friendData.points,
      currentStreak: friendData.currentStreak,
      lastVerificationAt: friendData.lastVerificationAt || null,
      lastSyncAt: serverTimestamp()
    });
  });

  await batch.commit();
}

// ============================================
// FRIEND DISCOVERY (Future Feature)
// ============================================

/**
 * Find potential friends who used your invite code
 * Returns users who redeemed this user's invite code
 */
export async function findInvitedFriends(userId: string): Promise<User[]> {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where('invitedBy', '==', userId));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  })) as User[];
}

/**
 * Get mutual friends between two users
 */
export async function getMutualFriends(
  userId: string,
  otherUserId: string
): Promise<Friend[]> {
  const [userFriends, otherUserFriends] = await Promise.all([
    getUserFriends(userId),
    getUserFriends(otherUserId)
  ]);

  const otherFriendIds = new Set(otherUserFriends.map((f) => f.userId));

  return userFriends.filter((friend) => otherFriendIds.has(friend.userId));
}
