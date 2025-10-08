import { db } from '../config/firebase';
import { UserProfile, UserPreferences } from '../types/user';
import { Timestamp, doc, getDoc, setDoc, updateDoc, collection, onSnapshot } from 'firebase/firestore';

const USERS_COLLECTION = 'users';

type FirestoreUserProfile = Omit<UserProfile, 'id' | 'createdAt' | 'lastLoginAt'> & {
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
};

export async function createUserProfile(userId: string, email: string): Promise<void> {
  const now = new Date();
  const defaultPreferences: UserPreferences = {
    notificationsEnabled: true,
    theme: 'system',
  };

  const userProfile: Omit<UserProfile, 'id'> = {
    email,
    emailVerified: false,
    createdAt: now,
    lastLoginAt: now,
    preferences: defaultPreferences,
    currentStreak: 0,
    longestStreak: 0,
    totalVerifications: 0,
    disciplineLevel: 'beginner',
  };

  const userRef = doc(db, USERS_COLLECTION, userId);
  await setDoc(userRef, userProfile);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) return null;

  const data = docSnap.data() as FirestoreUserProfile;
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt.toDate(),
    lastLoginAt: data.lastLoginAt.toDate(),
  };
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    ...updates,
    lastLoginAt: new Date(),
  });
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    'preferences': preferences,
  });
}

export function subscribeToUserProfile(
  userId: string,
  onUpdate: (profile: UserProfile) => void,
  onError?: (error: Error) => void
): () => void {
  const userRef = doc(db, USERS_COLLECTION, userId);
  return onSnapshot(
    userRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as FirestoreUserProfile;
        onUpdate({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          lastLoginAt: data.lastLoginAt.toDate(),
        });
      }
    },
    onError
  );
} 