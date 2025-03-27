// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Use a singleton pattern to avoid multiple initializations
let firebaseApp;
let firestoreDb;
let firebaseAuth;
let firebaseAnalytics;

try {
  // Check if Firebase is already initialized
  firebaseApp = initializeApp(firebaseConfig);
  firestoreDb = getFirestore(firebaseApp);
  firebaseAuth = getAuth(firebaseApp);
  
  // Analytics is optional and browser-only
  if (typeof window !== 'undefined') {
    firebaseAnalytics = getAnalytics(firebaseApp);
  }
} catch (error) {
  // If Firebase is already initialized, get the existing instances
  if (error.code === 'app/duplicate-app') {
    console.log('Firebase already initialized, using existing instance');
    firebaseApp = initializeApp();
    firestoreDb = getFirestore(firebaseApp);
    firebaseAuth = getAuth(firebaseApp);
    
    if (typeof window !== 'undefined') {
      firebaseAnalytics = getAnalytics(firebaseApp);
    }
  } else {
    console.error('Firebase initialization error:', error);
  }
}

// Export the initialized instances
export const app = firebaseApp;
export const db = firestoreDb;
export const auth = firebaseAuth;
export const analytics = firebaseAnalytics;

export default firebaseApp;