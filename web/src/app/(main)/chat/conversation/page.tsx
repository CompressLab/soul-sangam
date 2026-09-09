"use client";

import { Suspense } from "react";
import ConversationInner from "./ConversationInner";

export default function ConversationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>}>
      <ConversationInner />
    </Suspense>
  );
}
