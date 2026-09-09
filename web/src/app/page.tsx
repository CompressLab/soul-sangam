"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Shield, MessageCircle, Search, Star,
  Heart, Sparkles, Users, ArrowRight, CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Intelligent Matching",
    desc: "Advanced filters by faith, profession, location and values to find who truly matters.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: Shield,
    title: "Verified & Safe",
    desc: "Every profile is reviewed. Privacy controls give you full power over who sees you.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: MessageCircle,
    title: "Private Conversations",
    desc: "Chat only opens after mutual interest — your journey stays yours.",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    icon: Users,
    title: "Family Inclusive",
    desc: "Built with South Asian values in mind. Share profiles, involve family naturally.",
    gradient: "from-purple-500 to-violet-600",
  },
];

const testimonials = [
  {
    name: "Ayesha & Zayan",
    text: "Soul Sangam felt completely different — elegant, private and purposeful. We found each other within weeks.",
    location: "London, UK",
    rating: 5,
  },
  {
    name: "Priya & Arjun",
    text: "The design made everything feel trustworthy from day one. The filters helped us align on what matters most.",
    location: "Birmingham, UK",
    rating: 5,
  },
  {
    name: "Sara & Omar",
    text: "Photos blurred until interest matched was genius. It kept everything respectful and focused.",
    location: "Manchester, UK",
    rating: 5,
  },
];

const stats = [
  { value: "10,000+", label: "Verified Profiles" },
  { value: "2,500+", label: "Successful Unions" },
  { value: "50+",    label: "Countries" },
];

export default function LandingPage() {
  const { user, loading, signInWithGoogle, signInWithFacebook } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/browse");
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">

      {/* ── Navbar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center shadow-md">
              <Heart size={16} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-lg gradient-text">Soul Sangam</span>
          </div>
          <button
            onClick={signInWithGoogle}
            className="btn-primary text-xs px-5 py-2"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Deep gradient background */}
        <div className="absolute inset-0 bg-hero-gradient" />

        {/* Mesh overlay */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(139,92,246,0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(99,102,241,0.2) 0%, transparent 50%),
              radial-gradient(circle at 60% 80%, rgba(124,58,237,0.2) 0%, transparent 40%)
            `
          }}
        />

        {/* Floating decorative orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 py-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 text-sm text-white/90 mb-8 shadow-lg">
            <Sparkles size={14} className="text-gold-400" />
            <span>Trusted by thousands of families worldwide</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            Find Your
            <span className="block relative mt-1">
              <span className="relative z-10 bg-gradient-to-r from-gold-400 via-yellow-300 to-gold-400 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
                Perfect Match
              </span>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed">
            A modern matrimonial platform designed for South Asian families —
            private, purposeful, and built with the values that matter most.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={signInWithGoogle}
              className="group flex items-center gap-3 bg-white rounded-full px-7 py-3.5 text-slate-800 font-semibold text-sm shadow-xl shadow-black/20 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto justify-center"
            >
              <GoogleIcon />
              Continue with Google
              <ArrowRight size={14} className="opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
            </button>
            <button
              onClick={signInWithFacebook}
              className="flex items-center gap-3 bg-[#1877F2] border border-white/20 rounded-full px-7 py-3.5 text-white font-semibold text-sm shadow-xl shadow-black/20 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto justify-center"
            >
              <FacebookIcon />
              Continue with Facebook
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-extrabold text-white">{value}</div>
                <div className="text-sm text-white/60 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom wave */}
        <div className="relative -mb-px">
          <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="rgb(248 250 252)" />
          </svg>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-mesh">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 text-xs font-semibold text-primary-700 mb-4">
              <Sparkles size={12} />
              WHY SOUL SANGAM
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">
              Built different,{" "}
              <span className="gradient-text">by design</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">
              Every feature is crafted to make your search meaningful, private and dignified.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc, gradient }, i) => (
              <div
                key={title}
                className="card-gradient p-6 hover:shadow-lift hover:-translate-y-1 transition-all duration-300 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-base">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">
              Simple. <span className="gradient-text">Intentional.</span>
            </h2>
            <p className="text-slate-500 text-lg">Three steps to finding your person</p>
          </div>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-[calc(100%-80px)] bg-gradient-to-b from-primary-200 to-transparent hidden md:block" />
            <div className="space-y-8">
              {[
                { step: "01", title: "Create your profile", desc: "Fill in your story — faith, family, career, and what you're looking for in 5 simple steps.", side: "left" },
                { step: "02", title: "Discover compatible matches", desc: "Browse curated profiles filtered by your preferences. Send interest privately — no unsolicited messages.", side: "right" },
                { step: "03", title: "Connect meaningfully", desc: "When interest is mutual, a private conversation opens. No public chats, no spam.", side: "left" },
              ].map(({ step, title, desc, side }) => (
                <div key={step} className={`flex items-center gap-8 ${side === "right" ? "flex-row-reverse" : ""}`}>
                  <div className="flex-1">
                    <div className="card p-6 hover:shadow-lift transition-all duration-300">
                      <span className="text-xs font-black text-primary-400 tracking-widest">STEP {step}</span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">{title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center shadow-glow z-10 hidden md:flex">
                    <span className="text-2xl font-black text-white">{step}</span>
                  </div>
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-violet-900" />
        <div className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 30% 70%, rgba(139,92,246,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(99,102,241,0.15) 0%, transparent 50%)"
          }}
        />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Real stories,{" "}
              <span className="bg-gradient-to-r from-gold-400 to-yellow-300 bg-clip-text text-transparent">real happiness</span>
            </h2>
            <p className="text-white/60 text-lg">Families brought together through Soul Sangam</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, text, location, rating }) => (
              <div key={name} className="card-glass p-6 hover:-translate-y-1 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} size={14} className="text-gold-400 fill-gold-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-5 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{name}</div>
                    <div className="text-xs text-slate-500">{location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-mesh">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card-gradient p-12 shadow-lift">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Heart size={28} className="text-white" fill="white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Your story begins <span className="gradient-text">here</span>
            </h2>
            <p className="text-slate-500 mb-8 text-lg leading-relaxed">
              Join thousands of families who chose Soul Sangam for a search that's dignified, private, and meaningful.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={signInWithGoogle} className="btn-primary px-8 py-3 text-base">
                <GoogleIcon />
                Start with Google
              </button>
              <button onClick={signInWithFacebook} className="flex items-center gap-2 justify-center bg-[#1877F2] text-white rounded-full px-8 py-3 font-semibold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                <FacebookIcon />
                Start with Facebook
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-4">Free to join · No credit card required · Always private</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-10 px-4 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center">
              <Heart size={14} className="text-white" fill="white" />
            </div>
            <span className="font-bold gradient-text">Soul Sangam</span>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Soul Sangam. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-400">
            <a href="/terms"   className="hover:text-primary-600 transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-primary-600 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
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
