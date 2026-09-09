// Server component wrapper — required for static export with dynamic routes.
// Actual rendering done client-side in ProfileViewClient.
import { ProfileViewClient } from "./ProfileViewClient";

export const dynamic = "force-static";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default function ProfileViewPage() {
  return <ProfileViewClient />;
}
