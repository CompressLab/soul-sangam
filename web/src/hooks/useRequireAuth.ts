"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Redirects to /login if not authenticated.
 * Optionally redirects to /profile/setup if profile is incomplete.
 */
export function useRequireAuth(requireProfile = false) {
  const { user, loading, profileComplete } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (requireProfile && !profileComplete) {
      router.replace("/profile/setup");
    }
  }, [user, loading, profileComplete, requireProfile, router]);

  return { user, loading, profileComplete };
}
