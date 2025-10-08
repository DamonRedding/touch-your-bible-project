import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { startOfDay, parseISO, differenceInCalendarDays } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const VERIFICATIONS_COLLECTION = 'verifications';

export interface Verification {
  id: string;
  userId: string;
  timestamp: Date;
  userTimezone: string;
  verifiedDate: string; // YYYY-MM-DD format in user's local timezone
}

/**
 * Get user's current timezone from device
 */
function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get start of user's current day in UTC
 * This is used to query "today" in Firestore (which stores UTC timestamps)
 */
function getStartOfUserDayUTC(userTimezone: string): Date {
  const now = new Date();
  const userLocalTime = toZonedTime(now, userTimezone);
  const startOfUserLocalDay = startOfDay(userLocalTime);
  return fromZonedTime(startOfUserLocalDay, userTimezone);
}

/**
 * Get end of user's current day in UTC
 */
function getEndOfUserDayUTC(userTimezone: string): Date {
  const startOfDayUTC = getStartOfUserDayUTC(userTimezone);
  // Add 24 hours to get end of day
  return new Date(startOfDayUTC.getTime() + 24 * 60 * 60 * 1000);
}

/**
 * Format date as YYYY-MM-DD in user's timezone
 */
function formatUserLocalDate(date: Date, userTimezone: string): string {
  const zonedDate = toZonedTime(date, userTimezone);
  const year = zonedDate.getFullYear();
  const month = String(zonedDate.getMonth() + 1).padStart(2, '0');
  const day = String(zonedDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if user has already verified today
 * Returns the verification if found, null otherwise
 */
export async function checkAlreadyVerifiedToday(
  userId: string
): Promise<Verification | null> {
  try {
    const userTimezone = getUserTimezone();
    const startOfDayUTC = getStartOfUserDayUTC(userTimezone);
    const endOfDayUTC = getEndOfUserDayUTC(userTimezone);

    const verificationsRef = collection(db, VERIFICATIONS_COLLECTION);
    const q = query(
      verificationsRef,
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(startOfDayUTC)),
      where('timestamp', '<', Timestamp.fromDate(endOfDayUTC)),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      userId: data.userId,
      timestamp: data.timestamp.toDate(),
      userTimezone: data.userTimezone,
      verifiedDate: data.verifiedDate,
    };
  } catch (error) {
    console.error('Error checking verification:', error);
    throw new Error('Failed to check today\'s verification');
  }
}

/**
 * Create a new verification for today
 * Throws error if already verified today
 */
export async function createVerification(userId: string): Promise<Verification> {
  try {
    // First check if already verified today
    const existing = await checkAlreadyVerifiedToday(userId);
    if (existing) {
      throw new Error('Already verified today');
    }

    const userTimezone = getUserTimezone();
    const now = new Date();
    const verifiedDate = formatUserLocalDate(now, userTimezone);

    const verificationData = {
      userId,
      timestamp: serverTimestamp(),
      userTimezone,
      verifiedDate,
    };

    const docRef = await addDoc(
      collection(db, VERIFICATIONS_COLLECTION),
      verificationData
    );

    console.log('✅ Verification created:', docRef.id);

    return {
      id: docRef.id,
      userId,
      timestamp: now, // Optimistic - server will set actual timestamp
      userTimezone,
      verifiedDate,
    };
  } catch (error) {
    console.error('Error creating verification:', error);
    if (error instanceof Error && error.message === 'Already verified today') {
      throw error;
    }
    throw new Error('Failed to create verification');
  }
}

/**
 * Calculate current streak from verifications
 * Returns 0 if no streak, positive number for consecutive days
 */
export async function calculateCurrentStreak(userId: string): Promise<number> {
  try {
    const userTimezone = getUserTimezone();
    const verificationsRef = collection(db, VERIFICATIONS_COLLECTION);

    // Get all verifications for this user, ordered by most recent first
    const q = query(
      verificationsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return 0;
    }

    // Convert all verifications to local dates
    const verificationDates: Date[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp.toDate();
      const localDate = toZonedTime(timestamp, userTimezone);
      return startOfDay(localDate);
    });

    // Remove duplicates (same day, multiple verifications)
    const uniqueDates = Array.from(
      new Set(verificationDates.map((d) => d.toISOString()))
    ).map((iso) => parseISO(iso));

    // Calculate streak: count consecutive days working backward from most recent
    let streak = 0;
    const today = startOfDay(toZonedTime(new Date(), userTimezone));

    for (let i = 0; i < uniqueDates.length; i++) {
      const verificationDate = uniqueDates[i];
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - streak);

      const daysDiff = differenceInCalendarDays(
        startOfDay(expectedDate),
        startOfDay(verificationDate)
      );

      if (daysDiff === 0) {
        // This verification matches the expected date in the streak
        streak++;
      } else {
        // Gap in streak - stop counting
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    throw new Error('Failed to calculate streak');
  }
}

/**
 * Calculate longest streak from all verifications
 */
export async function calculateLongestStreak(userId: string): Promise<number> {
  try {
    const userTimezone = getUserTimezone();
    const verificationsRef = collection(db, VERIFICATIONS_COLLECTION);

    const q = query(
      verificationsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'asc') // Oldest first for longest streak calculation
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return 0;
    }

    // Convert to local dates
    const verificationDates: Date[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp.toDate();
      const localDate = toZonedTime(timestamp, userTimezone);
      return startOfDay(localDate);
    });

    // Remove duplicates
    const uniqueDates = Array.from(
      new Set(verificationDates.map((d) => d.toISOString()))
    ).map((iso) => parseISO(iso));

    // Find longest consecutive streak
    let longestStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = uniqueDates[i - 1];
      const currDate = uniqueDates[i];
      const daysDiff = differenceInCalendarDays(currDate, prevDate);

      if (daysDiff === 1) {
        // Consecutive day
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        // Gap - reset current streak
        currentStreak = 1;
      }
    }

    return Math.max(longestStreak, 1); // At least 1 if we have any verifications
  } catch (error) {
    console.error('Error calculating longest streak:', error);
    throw new Error('Failed to calculate longest streak');
  }
}

/**
 * Get total verification count
 */
export async function getTotalVerifications(userId: string): Promise<number> {
  try {
    const verificationsRef = collection(db, VERIFICATIONS_COLLECTION);
    const q = query(verificationsRef, where('userId', '==', userId));

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting total verifications:', error);
    throw new Error('Failed to get total verifications');
  }
}
