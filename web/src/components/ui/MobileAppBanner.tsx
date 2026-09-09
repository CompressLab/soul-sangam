"use client";

import { useEffect, useState } from "react";
import { X, Smartphone } from "lucide-react";

// Set this to true and update APK_URL once you've built and uploaded the APK
// to GitHub Releases (github.com/CompressLab/soul-sangam/releases)
const APK_READY = false;
const APK_DOWNLOAD_URL =
  "https://github.com/CompressLab/soul-sangam/releases/latest/download/soul-sangam.apk";

type Platform = "android" | "ios" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  return "other";
}

function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

export function MobileAppBanner() {
  const [visible,  setVisible]  = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    if (!isMobileBrowser()) return;
    const dismissed = sessionStorage.getItem("app-banner-dismissed");
    if (dismissed) return;
    setPlatform(detectPlatform());
    setVisible(true);
  }, []);

  function dismiss() {
    sessionStorage.setItem("app-banner-dismissed", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-label="Install Soul Sangam app"
      className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-xl
                 flex items-center gap-3 px-4 py-3"
    >
      {/* App icon */}
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm">
        <Smartphone size={24} className="text-white" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">Soul Sangam</p>
        <p className="text-xs text-gray-500">
          {platform === "android" && APK_READY
            ? "Install the app for the best experience"
            : platform === "android"
            ? "Android app coming soon"
            : platform === "ios"
            ? "iOS app coming soon"
            : "Mobile app coming soon"}
        </p>
      </div>

      {/* CTA — only show download button when APK is ready */}
      {platform === "android" && APK_READY && (
        <a
          href={APK_DOWNLOAD_URL}
          download="soul-sangam.apk"
          onClick={dismiss}
          className="flex-shrink-0 flex items-center gap-1.5 bg-primary-600 text-white
                     text-xs font-semibold px-3 py-2 rounded-full shadow-sm
                     hover:bg-primary-700 transition"
          aria-label="Download Soul Sangam Android app"
        >
          Install
        </a>
      )}

      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss app install banner"
        className="flex-shrink-0 p-1.5 rounded-full text-gray-400 hover:text-gray-600
                   hover:bg-gray-100 transition"
      >
        <X size={16} />
      </button>
    </div>
  );
}
