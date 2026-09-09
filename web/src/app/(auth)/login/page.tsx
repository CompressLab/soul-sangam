"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Heart, Sparkles, Shield, Users } from "lucide-react";

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithFacebook } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/browse");
  }, [user, loading, router]);

  return (
    <main className="min-h-screen flex">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-hero-gradient flex-col justify-between p-12">
        {/* Mesh overlay */}
        <div className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(139,92,246,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 20%, rgba(99,102,241,0.2) 0%, transparent 50%)" }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
              <Heart size={18} className="text-white" fill="white" />
            </div>
            <span className="text-white font-bold text-xl">Soul Sangam</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Find your<br />
              <span className="bg-gradient-to-r from-gold-400 to-yellow-300 bg-clip-text text-transparent">
                life partner
              </span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-sm">
              A dignified platform for South Asian families to find meaningful, lasting connections.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Shield, text: "Verified profiles only" },
              { icon: Users,  text: "Built for families" },
              { icon: Sparkles, text: "Smart matching algorithm" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-white" />
                </div>
                <span className="text-white/80 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/40 text-xs">
          © {new Date().getFullYear()} Soul Sangam
        </p>
      </div>

      {/* Right — auth panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 bg-mesh">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center shadow-glow">
              <Heart size={18} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-xl gradient-text">Soul Sangam</span>
          </div>

          <div className="card p-8 shadow-lift">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900">Welcome back</h2>
              <p className="text-slate-500 mt-1.5 text-sm">Sign in to continue your journey</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <button
                onClick={signInWithFacebook}
                className="w-full flex items-center justify-center gap-3 bg-[#1877F2] rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <FacebookIcon />
                Continue with Facebook
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-center text-slate-400 leading-relaxed">
                By continuing, you agree to our{" "}
                <a href="/terms" className="text-primary-600 hover:underline font-medium">Terms</a>
                {" "}and{" "}
                <a href="/privacy" className="text-primary-600 hover:underline font-medium">Privacy Policy</a>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Free to join · No credit card required
          </p>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="flex-shrink-0">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="flex-shrink-0">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z"/>
    </svg>
  );
}
