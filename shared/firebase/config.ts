import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Guard: fail fast with a clear message if env vars are missing
// (prevents the cryptic auth/argument-error at runtime)
if (typeof window !== "undefined") {
  const required = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ] as const;
  for (const key of required) {
    if (!process.env[key]) {
      console.error(
        `[Soul Sangam] Missing environment variable: ${key}. ` +
        `Check your .env.local file and rebuild.`
      );
    }
  }
}

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);

export const googleProvider   = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

googleProvider.addScope("email");
googleProvider.addScope("profile");
facebookProvider.addScope("email");
facebookProvider.addScope("public_profile");
