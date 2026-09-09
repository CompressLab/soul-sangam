"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function MyProfileRedirect() {
  const { user } = useRequireAuth();
  const router   = useRouter();

  useEffect(() => {
    if (user) router.replace(`/profile/view?uid=${user.uid}`);
  }, [user, router]);

  return null;
}
