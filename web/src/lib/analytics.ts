/**
 * GA4 event tracking helpers.
 * Uses window.gtag injected by the Script tag in layout.tsx.
 * Safe to call even if GA4 hasn't loaded yet — checks for gtag existence.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function gtag(...args: unknown[]) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag(...args);
}

/** Track a page view — called on route changes in SPA navigation */
export function trackPageView(url: string) {
  gtag("config", process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "", {
    page_path: url,
  });
}

/** Track a custom GA4 event */
export function trackEvent(
  action: string,
  params?: Record<string, string | number | boolean>
) {
  gtag("event", action, params ?? {});
}

// ── Pre-built event helpers ────────────────────────────────────────────────

export const ga = {
  /** User signed in */
  signIn: (method: "google" | "facebook") =>
    trackEvent("login", { method }),

  /** User completed profile setup */
  profileCreated: () =>
    trackEvent("profile_created"),

  /** User viewed another profile */
  profileViewed: (targetUid: string) =>
    trackEvent("profile_view", { target_uid: targetUid }),

  /** User sent an interest */
  interestSent: (targetUid: string) =>
    trackEvent("interest_sent", { target_uid: targetUid }),

  /** User accepted an interest */
  interestAccepted: () =>
    trackEvent("interest_accepted"),

  /** User started a chat */
  chatStarted: () =>
    trackEvent("chat_started"),

  /** User sent a message */
  messageSent: () =>
    trackEvent("message_sent"),

  /** User searched/filtered profiles */
  browseFiltered: (filters: Record<string, string>) =>
    trackEvent("browse_filtered", filters),
};
