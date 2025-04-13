import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail, onAuthStateChanged, signInAnonymously as firebaseSignInAnonymously } from 'firebase/auth';
import { auth } from '../config/firebase';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import { View, ActivityIndicator } from 'react-native';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  isAnonymous: boolean;
  profile: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) {
    return fallback || null;
  }

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUser(user);
      setIsAnonymous(user?.isAnonymous ?? false);
      setIsLoading(false);
    }, (error: Error) => {
      console.error('Auth state change error:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Sign in attempt:', {
        email,
        platform: Platform.OS,
        authConfig: {
          apiKey: auth.app.options.apiKey?.substring(0, 8) + '...',
          authDomain: auth.app.options.authDomain,
          projectId: auth.app.options.projectId
        }
      });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful:', userCredential.user.uid);
      router.replace('/(home)');
    } catch (error: any) {
      console.error('Sign in error details:', {
        code: error.code,
        message: error.message,
        name: error.name,
        platform: Platform.OS,
        networkState: {
          online: true, // This is a placeholder as we can't directly check network state
          timestamp: new Date().toISOString()
        }
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace('/(home)');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await firebaseSignOut(auth);
      router.replace('/(auth)');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInAnonymously = async () => {
    try {
      setIsLoading(true);
      console.log('Attempting anonymous sign in...');
      const userCredential = await firebaseSignInAnonymously(auth);
      console.log('Anonymous sign in successful:', userCredential.user.uid);
      router.replace('/(home)');
    } catch (error: any) {
      console.error('Anonymous sign in error:', {
        code: error.code,
        message: error.message,
        name: error.name,
        platform: Platform.OS
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInAnonymously,
        isAnonymous,
        profile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 