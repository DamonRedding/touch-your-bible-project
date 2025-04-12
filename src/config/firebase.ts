import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUaf9rBALwZkLJ89Z7aPN7mWYU1sEwCxY",
  authDomain: "touch-your-bible.firebaseapp.com",
  projectId: "touch-your-bible",
  storageBucket: "touch-your-bible.firebasestorage.app",
  messagingSenderId: "792342933338",
  appId: "1:792342933338:web:44a9d17ebea4e6aefc8d63",
  measurementId: "G-1YHTWFG3NF"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  if (getApps().length === 0) {
    console.log('Initializing Firebase with config:', {
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      platform: Platform.OS
    });
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  // Initialize Auth
  auth = getAuth(app);
  
  // Initialize Firestore
  db = getFirestore(app);

  // Enable network logging in development
  if (__DEV__) {
    console.log('Firebase initialized successfully:', {
      platform: Platform.OS,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      isAuthInitialized: !!auth,
      isFirestoreInitialized: !!db
    });
  }
} catch (error) {
  console.error('Firebase initialization error:', {
    error,
    platform: Platform.OS,
    config: {
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId
    }
  });
  throw error;
}

export { app, auth, db }; 