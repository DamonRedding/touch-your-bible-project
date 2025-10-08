// Firestore Schema Types - Touch Your Bible
// Generated from FIRESTORE_SCHEMA.md

import { Timestamp } from 'firebase/firestore';
import type {
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreDataConverter
} from 'firebase/firestore';

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

export const verificationConverter: FirestoreDataConverter<Verification> = {
  toFirestore(verification: Verification): DocumentData {
    return { ...verification };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Verification {
    return snapshot.data() as Verification;
  }
};
