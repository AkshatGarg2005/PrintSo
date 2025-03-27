// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your Firebase configuration - copy this EXACTLY as it appears in your Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyAJYaP8AzTkC9Lol0O_6anbG7AZA4mpzgM",
  authDomain: "printso.firebaseapp.com",
  projectId: "printso",
  storageBucket: "printso.appspot.com", // This might be different from what you had before
  messagingSenderId: "844073795597",
  appId: "1:844073795597:web:7d865750e586fa063fd544",
  measurementId: "G-HXQP6E78JS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
export default app;