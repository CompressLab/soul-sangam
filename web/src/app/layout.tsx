import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import { MobileAppBanner } from "@/components/ui/MobileAppBanner";
import { PageViewTracker } from "@/components/ui/PageViewTracker";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

// GA4 Measurement ID — from Firebase project (Analytics)
const GA_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "";

export const metadata: Metadata = {
  title:       "Familiara — Find Your Match",
  description: "A trusted matrimonial platform to help you find your life partner.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* GA4 — only load when measurement ID is present */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                  send_page_view: true
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <PageViewTracker />
          {children}
          <MobileAppBanner />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: "12px", fontSize: "14px" },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
