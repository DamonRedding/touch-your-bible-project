// Leaderboard Service - Touch Your Bible
// Handles global and friends leaderboard queries

import { db } from '../config/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  where,
  getCountFromServer,
  Unsubscribe
} from 'firebase/firestore';
import type { User, Friend, LeaderboardEntry, FriendsLeaderboardEntry } from '../types/firestore';

const USERS_COLLECTION = 'users';

// ============================================
// GLOBAL LEADERBOARD
// ============================================

/**
 * Get global leaderboard (top N users)
 * Requires composite index: [points DESC, currentStreak DESC, createdAt ASC]
 */
export async function getGlobalLeaderboard(
  topN: number = 100
): Promise<LeaderboardEntry[]> {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(
    usersRef,
    orderBy('points', 'desc'),
    orderBy('currentStreak', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(topN)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc, index) => ({
    rank: index + 1,
    user: { id: doc.id, ...doc.data() } as User
  }));
}

/**
 * Subscribe to global leaderboard real-time updates
 * Returns unsubscribe function
 */
export function subscribeToGlobalLeaderboard(
  topN: number = 100,
  onUpdate: (leaderboard: LeaderboardEntry[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(
    usersRef,
    orderBy('points', 'desc'),
    orderBy('currentStreak', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(topN)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const leaderboard = snapshot.docs.map((doc, index) => ({
        rank: index + 1,
        user: { id: doc.id, ...doc.data() } as User
      }));
      onUpdate(leaderboard);
    },
    onError
  );
}

// ============================================
// FRIENDS LEADERBOARD
// ============================================

/**
 * Get friends leaderboard for a user
 * Requires composite index: [points DESC, currentStreak DESC, connectedAt ASC]
 */
export async function getFriendsLeaderboard(
  userId: string
): Promise<FriendsLeaderboardEntry[]> {
  const friendsRef = collection(db, USERS_COLLECTION, userId, 'friends');
  const q = query(
    friendsRef,
    orderBy('points', 'desc'),
    orderBy('currentStreak', 'desc'),
    orderBy('connectedAt', 'asc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc, index) => ({
    rank: index + 1,
    friend: { id: doc.id, ...doc.data() } as Friend
  }));
}

/**
 * Subscribe to friends leaderboard real-time updates
 * Returns unsubscribe function
 */
export function subscribeToFriendsLeaderboard(
  userId: string,
  onUpdate: (leaderboard: FriendsLeaderboardEntry[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const friendsRef = collection(db, USERS_COLLECTION, userId, 'friends');
  const q = query(
    friendsRef,
    orderBy('points', 'desc'),
    orderBy('currentStreak', 'desc'),
    orderBy('connectedAt', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const leaderboard = snapshot.docs.map((doc, index) => ({
        rank: index + 1,
        friend: { id: doc.id, ...doc.data() } as Friend
      }));
      onUpdate(leaderboard);
    },
    onError
  );
}

// ============================================
// USER RANK CALCULATION (Optional - Expensive)
// ============================================

/**
 * Calculate user's rank in global leaderboard
 * WARNING: Expensive operation, use sparingly
 * Uses COUNT aggregation query (scales to ~1M users)
 */
export async function getUserGlobalRank(
  userId: string,
  userPoints: number
): Promise<number> {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where('points', '>', userPoints));

  const snapshot = await getCountFromServer(q);
  return snapshot.data().count + 1;
}

/**
 * Calculate user's rank in friends leaderboard
 */
export async function getUserFriendsRank(
  userId: string,
  targetFriendId: string
): Promise<number> {
  const friendsRef = collection(db, USERS_COLLECTION, userId, 'friends');
  const snapshot = await getDocs(friendsRef);

  // Get target friend's points
  const targetFriend = snapshot.docs.find((doc) => doc.id === targetFriendId);
  if (!targetFriend) {
    throw new Error('Friend not found');
  }

  const targetPoints = (targetFriend.data() as Friend).points;

  // Count friends with higher points
  const higherRanked = snapshot.docs.filter((doc) => {
    const friend = doc.data() as Friend;
    return friend.points > targetPoints;
  });

  return higherRanked.length + 1;
}

// ============================================
// LEADERBOARD UTILITIES
// ============================================

/**
 * Get user's position in leaderboard (if in top N)
 * Returns null if user not in top N
 */
export async function getUserPositionInTopN(
  userId: string,
  topN: number = 100
): Promise<number | null> {
  const leaderboard = await getGlobalLeaderboard(topN);
  const position = leaderboard.findIndex((entry) => entry.user.id === userId);

  return position === -1 ? null : position + 1;
}

/**
 * Get users around a specific rank (context leaderboard)
 * Useful for showing "you are here" in leaderboard
 */
export async function getLeaderboardContext(
  userRank: number,
  contextSize: number = 5
): Promise<LeaderboardEntry[]> {
  const start = Math.max(1, userRank - contextSize);
  const end = userRank + contextSize;
  const total = end - start + 1;

  // Note: This requires fetching from start position
  // For MVP, we just fetch top N and slice
  const leaderboard = await getGlobalLeaderboard(end);

  return leaderboard.slice(start - 1, end);
}

// ============================================
// STREAK LEADERBOARD (Alternative Sort)
// ============================================

/**
 * Get leaderboard sorted by current streak
 * Requires composite index: [currentStreak DESC, points DESC, createdAt ASC]
 */
export async function getStreakLeaderboard(
  topN: number = 100
): Promise<LeaderboardEntry[]> {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(
    usersRef,
    orderBy('currentStreak', 'desc'),
    orderBy('points', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(topN)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc, index) => ({
    rank: index + 1,
    user: { id: doc.id, ...doc.data() } as User
  }));
}

// ============================================
// PERFORMANCE MONITORING
// ============================================

/**
 * Measure leaderboard query performance
 * Returns time in milliseconds
 */
export async function measureLeaderboardPerformance(
  queryType: 'global' | 'friends',
  userId?: string
): Promise<{ durationMs: number; resultCount: number }> {
  const startTime = performance.now();

  let resultCount = 0;

  if (queryType === 'global') {
    const results = await getGlobalLeaderboard(100);
    resultCount = results.length;
  } else if (queryType === 'friends' && userId) {
    const results = await getFriendsLeaderboard(userId);
    resultCount = results.length;
  }

  const endTime = performance.now();
  const durationMs = endTime - startTime;

  return { durationMs, resultCount };
}
