"use client";

import { Suspense } from "react";
import ProfileViewInner from "./ProfileViewInner";

export default function ProfileViewPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto animate-pulse space-y-4 mt-8"><div className="h-96 rounded-2xl bg-gray-200" /><div className="h-6 w-48 rounded bg-gray-200" /></div>}>
      <ProfileViewInner />
    </Suspense>
  );
}
