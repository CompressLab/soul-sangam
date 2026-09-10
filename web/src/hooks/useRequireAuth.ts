"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Redirects to /login if not authenticated.
 * If requireProfile=true, redirects to /profile/setup when profileComplete is false.
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
