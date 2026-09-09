"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider, facebookProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Firebase error codes that should be silently ignored (user-initiated cancel)
const SILENT_AUTH_CODES = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/user-cancelled",
]);

// Map Firebase error codes to friendly messages
function friendlyAuthError(err: unknown): string | null {
  const code = (err as { code?: string })?.code;
  if (!code) return err instanceof Error ? err.message : null;
  if (SILENT_AUTH_CODES.has(code)) return null; // return null = silent
  const messages: Record<string, string> = {
    "auth/network-request-failed": "Network error. Please check your connection.",
    "auth/too-many-requests":      "Too many attempts. Please try again later.",
    "auth/user-disabled":          "This account has been disabled.",
    "auth/account-exists-with-different-credential":
      "An account already exists with this email. Try a different sign-in method.",
  };
  return messages[code] ?? "Sign-in failed. Please try again.";
}

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
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          setProfileComplete(snap.exists() && !!snap.data()?.profileComplete);
        } catch {
          setProfileComplete(false);
        }
      } else {
        setProfileComplete(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

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
      toast.success(`Welcome, ${result.user.displayName ?? ""}!`);
      router.push("/browse");
    } catch (err: unknown) {
      const msg = friendlyAuthError(err);
      if (msg) toast.error(msg);
    }
  }

  async function signInWithFacebook() {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      await ensureUserDoc(result.user);
      toast.success(`Welcome, ${result.user.displayName ?? ""}!`);
      router.push("/browse");
    } catch (err: unknown) {
      const msg = friendlyAuthError(err);
      if (msg) toast.error(msg);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      router.push("/");
      toast.success("Signed out successfully.");
    } catch {
      toast.error("Failed to sign out. Please try again.");
    }
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
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
