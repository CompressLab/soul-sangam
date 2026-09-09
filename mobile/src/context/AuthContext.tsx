import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithCredential,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { LoginManager, AccessToken } from "react-native-fbsdk-next";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import Constants from "expo-constants";

interface AuthContextValue {
  user:              User | null;
  loading:           boolean;
  profileComplete:   boolean;
  signInWithGoogle:   () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  logout:             () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Configure Google Sign-In once
GoogleSignin.configure({
  webClientId: Constants.expoConfig?.extra?.googleWebClientId ?? "",
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,            setUser]            = useState<User | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        const snap = await getDoc(doc(db, "users", fbUser.uid));
        setProfileComplete(snap.exists() && !!snap.data()?.profileComplete);
      } else {
        setProfileComplete(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function ensureUserDoc(fbUser: User) {
    const ref  = doc(db, "users", fbUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid:             fbUser.uid,
        displayName:     fbUser.displayName ?? "",
        email:           fbUser.email ?? "",
        photoURL:        fbUser.photoURL ?? null,
        photos:          [],
        createdAt:       Date.now(),
        updatedAt:       Date.now(),
        profileComplete: false,
        profileVisible:  true,
        photosBlurred:   false,
        verified:        false,
      });
    }
  }

  async function signInWithGoogle() {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const credential  = GoogleAuthProvider.credential(idToken);
      const result      = await signInWithCredential(auth, credential);
      await ensureUserDoc(result.user);
      Toast.show({ type: "success", text1: `Welcome, ${result.user.displayName}!` });
      router.replace(result.user ? "/browse" : "/login");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      Toast.show({ type: "error", text1: msg });
    }
  }

  async function signInWithFacebook() {
    try {
      const result = await LoginManager.logInWithPermissions(["public_profile", "email"]);
      if (result.isCancelled) return;
      const data = await AccessToken.getCurrentAccessToken();
      if (!data) throw new Error("No Facebook access token");
      const credential = FacebookAuthProvider.credential(data.accessToken);
      const fbResult   = await signInWithCredential(auth, credential);
      await ensureUserDoc(fbResult.user);
      Toast.show({ type: "success", text1: `Welcome, ${fbResult.user.displayName}!` });
      router.replace("/browse");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Facebook sign-in failed";
      Toast.show({ type: "error", text1: msg });
    }
  }

  async function logout() {
    await signOut(auth);
    router.replace("/");
    Toast.show({ type: "success", text1: "Signed out successfully" });
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, profileComplete, signInWithGoogle, signInWithFacebook, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}
