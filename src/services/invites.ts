// Invite System Service - Touch Your Bible
// Handles invite code generation, validation, and redemption

import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  increment,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';
import type { Invite, User } from '../types/firestore';

const INVITES_COLLECTION = 'invites';
const USERS_COLLECTION = 'users';

// ============================================
// INVITE CODE GENERATION
// ============================================

/**
 * Generate a random invite code in format: TOUCH-XXXX
 * Uses non-ambiguous characters to prevent user errors
 */
function generateInviteCode(): string {
  // Exclude ambiguous characters: 0, O, I, 1, L
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomPart = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');

  return `TOUCH-${randomPart}`;
}

/**
 * Create a unique invite code for a user
 * Retries up to 10 times if code already exists
 */
export async function createUniqueInviteCode(userId: string, userEmail?: string): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateInviteCode();
    const inviteRef = doc(db, INVITES_COLLECTION, code);

    try {
      // Atomic create (fails if exists)
      const inviteData: Omit<Invite, 'code'> & { code: string } = {
        code: code,
        createdBy: userId,
        createdAt: serverTimestamp() as Timestamp,
        usedBy: [],
        useCount: 0,
        maxUses: 5,
        isActive: true,
        ...(userEmail && { createdByEmail: userEmail })
      };

      await runTransaction(db, async (transaction) => {
        const inviteDoc = await transaction.get(inviteRef);

        if (inviteDoc.exists()) {
          throw new Error('Code already exists');
        }

        transaction.set(inviteRef, inviteData);
      });

      return code; // Success
    } catch (error) {
      if (error instanceof Error && error.message === 'Code already exists') {
        attempts++;
        continue; // Retry with new code
      }
      throw error; // Other error
    }
  }

  throw new Error('Failed to generate unique invite code after 10 attempts');
}

// ============================================
// INVITE VALIDATION
// ============================================

/**
 * Validate an invite code
 * Returns invite data if valid, null if invalid or expired
 */
export async function validateInviteCode(code: string): Promise<Invite | null> {
  const inviteRef = doc(db, INVITES_COLLECTION, code);
  const inviteDoc = await getDoc(inviteRef);

  if (!inviteDoc.exists()) {
    return null;
  }

  const invite = inviteDoc.data() as Invite;

  // Check if code is still valid
  if (!invite.isActive || invite.useCount >= invite.maxUses) {
    return null;
  }

  return invite;
}

/**
 * Get invite code details (for display purposes)
 */
export async function getInviteDetails(code: string): Promise<Invite | null> {
  const inviteRef = doc(db, INVITES_COLLECTION, code);
  const inviteDoc = await getDoc(inviteRef);

  if (!inviteDoc.exists()) {
    return null;
  }

  return inviteDoc.data() as Invite;
}

// ============================================
// INVITE REDEMPTION
// ============================================

/**
 * Redeem an invite code
 * Updates invite usage, sets invitedBy, and awards bonus points to referrer
 */
export async function redeemInviteCode(
  inviteCode: string,
  newUserId: string
): Promise<void> {
  const inviteRef = doc(db, INVITES_COLLECTION, inviteCode);
  const userRef = doc(db, USERS_COLLECTION, newUserId);

  await runTransaction(db, async (transaction) => {
    // Get invite document
    const inviteDoc = await transaction.get(inviteRef);

    // Validation
    if (!inviteDoc.exists()) {
      throw new Error('Invalid invite code');
    }

    const invite = inviteDoc.data() as Invite;

    // Check if invite is valid
    if (!invite.isActive) {
      throw new Error('Invite code is no longer active');
    }

    if (invite.useCount >= invite.maxUses) {
      throw new Error('Invite code has reached maximum uses');
    }

    if (invite.usedBy?.includes(newUserId)) {
      throw new Error('You have already used this invite code');
    }

    if (invite.createdBy === newUserId) {
      throw new Error('Cannot use your own invite code');
    }

    // Update invite document
    transaction.update(inviteRef, {
      usedBy: arrayUnion(newUserId),
      useCount: increment(1),
      isActive: invite.useCount + 1 < invite.maxUses
    });

    // Update new user's invitedBy field
    transaction.update(userRef, {
      invitedBy: invite.createdBy
    });

    // Get referrer document to check invite count
    const referrerRef = doc(db, USERS_COLLECTION, invite.createdBy);
    const referrerDoc = await transaction.get(referrerRef);

    if (!referrerDoc.exists()) {
      throw new Error('Referrer user not found');
    }

    const referrer = referrerDoc.data() as User;

    // Award bonus points to referrer (max 5 invites)
    if (referrer.inviteCount < 5) {
      transaction.update(referrerRef, {
        inviteCount: increment(1),
        invitePoints: increment(10),
        points: increment(10) // Update total points
      });
    }
  });
}

// ============================================
// INVITE ANALYTICS (Future)
// ============================================

/**
 * Get user's invite statistics
 */
export async function getUserInviteStats(userId: string): Promise<{
  code: string;
  usesRemaining: number;
  totalUses: number;
  pointsEarned: number;
}> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const user = userDoc.data() as User;
  const inviteRef = doc(db, INVITES_COLLECTION, user.inviteCode);
  const inviteDoc = await getDoc(inviteRef);

  const invite = inviteDoc.exists() ? (inviteDoc.data() as Invite) : null;

  return {
    code: user.inviteCode,
    usesRemaining: invite ? invite.maxUses - invite.useCount : 5,
    totalUses: user.inviteCount,
    pointsEarned: user.invitePoints
  };
}

/**
 * Get list of users who used this user's invite code
 */
export async function getInvitedUsers(userId: string): Promise<string[]> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const user = userDoc.data() as User;
  const inviteRef = doc(db, INVITES_COLLECTION, user.inviteCode);
  const inviteDoc = await getDoc(inviteRef);

  if (!inviteDoc.exists()) {
    return [];
  }

  const invite = inviteDoc.data() as Invite;
  return invite.usedBy || [];
}
