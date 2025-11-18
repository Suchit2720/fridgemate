// src/lib/firebase.js
import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ✅ Firebase configuration (corrected for your project)
const firebaseConfig = {
  apiKey: "AIzaSyBAZyKn0EVMj5weReiTumecixhAIasQXSY",
  authDomain: "fridgemate-321dc.firebaseapp.com",
  projectId: "fridgemate-321dc",
  storageBucket: "fridgemate-321dc.appspot.com",
  messagingSenderId: "603164299853",
  appId: "1:603164299853:web:9b1874045f8f674721c204",
  measurementId: "G-VKEPMZPES8"
};

// ✅ Initialize (or reuse) the Firebase app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Initialize Auth with AsyncStorage persistence on native, fallback to getAuth otherwise
let authInstance;
if (Platform.OS === 'web') {
  authInstance = getAuth(app);
} else {
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (err) {
    authInstance = getAuth(app);
  }
}

export const auth = authInstance;

// ✅ Initialize Firestore
export const db = getFirestore(app);

// ✅ Initialize Storage
export const storage = getStorage(app);
