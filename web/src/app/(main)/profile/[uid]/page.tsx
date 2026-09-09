// Server component wrapper — required for static export with dynamic routes.
// generateStaticParams returns [] so no pages are pre-built;
// the actual rendering is done client-side in ProfileViewClient.
import { ProfileViewClient } from "./ProfileViewClient";

export function generateStaticParams() {
  return [];
}

export default function ProfileViewPage() {
  return <ProfileViewClient />;
}
