// Server component wrapper for static export compatibility.
// generateStaticParams returns [] — pages render client-side at runtime.
import { ConversationClient } from "./ConversationClient";

// Required for static export — dynamic params are handled client-side
export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default function ConversationPage() {
  return <ConversationClient />;
}
