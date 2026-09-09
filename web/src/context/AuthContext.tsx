"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider, facebookProvider } from "@shared/firebase/config";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AuthContextValue {
  user:             User | null;
  loading:          boolean;
  profileComplete:  boolean;
  signInWithGoogle:   () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  logout:             () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,            setUser]            = useState<User | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check if user has a profile document
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        setProfileComplete(snap.exists() && !!snap.data()?.profileComplete);
      } else {
        setProfileComplete(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  /** Create a stub user doc on first sign-in */
  async function ensureUserDoc(firebaseUser: User) {
    const ref  = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid:             firebaseUser.uid,
        displayName:     firebaseUser.displayName ?? "",
        email:           firebaseUser.email ?? "",
        photoURL:        firebaseUser.photoURL ?? null,
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
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserDoc(result.user);
      toast.success(`Welcome, ${result.user.displayName}!`);
      router.push("/browse");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      toast.error(msg);
    }
  }

  async function signInWithFacebook() {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      await ensureUserDoc(result.user);
      toast.success(`Welcome, ${result.user.displayName}!`);
      router.push("/browse");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Facebook sign-in failed";
      toast.error(msg);
    }
  }

  async function logout() {
    await signOut(auth);
    router.push("/");
    toast.success("Signed out successfully.");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profileComplete,
        signInWithGoogle,
        signInWithFacebook,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
