import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";

const {
  firebaseApiKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId,
} = Constants.expoConfig?.extra ?? {};

const firebaseConfig = {
  apiKey:            firebaseApiKey,
  authDomain:        firebaseAuthDomain,
  projectId:         firebaseProjectId,
  storageBucket:     firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId:             firebaseAppId,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// AsyncStorage persistence keeps the user signed in after app restarts
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
// Note: Firebase Storage removed — photos are uploaded via Cloudinary
// See shared/utils/cloudinary.ts → uploadUriToCloudinary()
