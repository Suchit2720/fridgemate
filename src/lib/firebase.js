// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// ✅ Use your real Firebase config (copied from your snippet)
const firebaseConfig = {
  apiKey: "AIzaSyBAZyKn0EVMj5weReiTumecixhAIasQXSY",
  authDomain: "fridgemate-321dc.firebaseapp.com",
  projectId: "fridgemate-321dc",
  storageBucket: "fridgemate-321dc.firebasestorage.app",
  messagingSenderId: "603164299853",
  appId: "1:603164299853:web:9b1874045f8f674721c204",
  measurementId: "G-VKEPMZPES8"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize persistent Auth for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Firestore database
export const db = getFirestore(app);