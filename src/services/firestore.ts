import { db } from '../config/firebase';
import { UserProfile, UserPreferences } from '../types/user';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

const USERS_COLLECTION = 'users';

type FirestoreUserProfile = Omit<UserProfile, 'id' | 'createdAt' | 'lastLoginAt'> & {
  createdAt: FirebaseFirestoreTypes.Timestamp;
  lastLoginAt: FirebaseFirestoreTypes.Timestamp;
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

  await db.collection(USERS_COLLECTION).doc(userId).set(userProfile);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const doc = await db.collection(USERS_COLLECTION).doc(userId).get();
  if (!doc.exists) return null;
  
  const data = doc.data() as FirestoreUserProfile;
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt.toDate(),
    lastLoginAt: data.lastLoginAt.toDate(),
  };
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>
): Promise<void> {
  await db.collection(USERS_COLLECTION).doc(userId).update({
    ...updates,
    lastLoginAt: new Date(),
  });
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  await db.collection(USERS_COLLECTION).doc(userId).update({
    'preferences': preferences,
  });
}

export function subscribeToUserProfile(
  userId: string,
  onUpdate: (profile: UserProfile) => void,
  onError?: (error: Error) => void
): () => void {
  return db.collection(USERS_COLLECTION)
    .doc(userId)
    .onSnapshot(
      (doc) => {
        if (doc.exists) {
          const data = doc.data() as FirestoreUserProfile;
          onUpdate({
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            lastLoginAt: data.lastLoginAt.toDate(),
          });
        }
      },
      onError
    );
} 