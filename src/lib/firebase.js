// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ✅ Firebase configuration (corrected for your project)
const firebaseConfig = {
  apiKey: "AIzaSyBAZyKn0EVMj5weReiTumecixhAIasQXSY",
  authDomain: "fridgemate-321dc.firebaseapp.com",
  projectId: "fridgemate-321dc",
  storageBucket: "fridgemate-321dc.firebasestorage.app", // ✅ Correct bucket name
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

// ✅ Initialize Firestore
export const db = getFirestore(app);

// ✅ Initialize Storage
export const storage = getStorage(app);