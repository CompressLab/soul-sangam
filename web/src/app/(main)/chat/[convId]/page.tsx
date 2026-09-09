// Server component wrapper for static export compatibility.
// generateStaticParams returns [] — pages render client-side at runtime.
import { ConversationClient } from "./ConversationClient";

export function generateStaticParams() {
  return [];
}

export default function ConversationPage() {
  return <ConversationClient />;
}
