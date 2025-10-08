import { User } from 'firebase/auth';

export interface UserPreferences {
  notificationsEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  dailyReminderTime?: string;
  theme: 'light' | 'dark' | 'system';
}

export interface UserProfile {
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

export interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
}

export type AuthUser = User; 