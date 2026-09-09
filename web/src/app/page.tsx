"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Heart, Search, MessageCircle, Shield, Users, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const features = [
  {
    icon: Search,
    title: "Smart Search",
    desc: "Filter by religion, location, age, profession and more to find compatible matches.",
  },
  {
    icon: Shield,
    title: "Safe & Verified",
    desc: "Every profile goes through our verification process to keep the community trustworthy.",
  },
  {
    icon: MessageCircle,
    title: "Private Chat",
    desc: "Connect directly only after both parties show interest — your privacy is protected.",
  },
  {
    icon: Users,
    title: "Family Involvement",
    desc: "Share profiles easily with family members to involve them in your search.",
  },
];

const testimonials = [
  {
    name: "Fatima & Yusuf",
    text: "We found each other through Soul Sangam within 3 months. Simple, safe and effective.",
    location: "London, UK",
  },
  {
    name: "Priya & Arjun",
    text: "The filtering made it so easy to find someone who shared our values. Highly recommended.",
    location: "Birmingham, UK",
  },
  {
    name: "Sara & Omar",
    text: "Loved how private it felt. Photos only visible after mutual interest — perfect.",
    location: "Manchester, UK",
  },
];

export default function LandingPage() {
  const { user, loading, signInWithGoogle, signInWithFacebook } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/browse");
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Heart className="text-primary-600" size={22} fill="currentColor" />
            <span className="font-bold text-primary-700 text-lg">Soul Sangam</span>
          </div>
          <Link href="/login" className="btn-primary text-xs px-4 py-2">
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
            <Star size={14} fill="currentColor" />
            <span>Trusted by thousands of families</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Find Your Perfect<br />Life Partner
          </h1>
          <p className="text-lg text-primary-100 mb-10 max-w-xl mx-auto">
            A safe, modern matrimonial platform designed to help you find a compatible partner
            with the values that matter most to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={signInWithGoogle}
              className="flex items-center justify-center gap-3 rounded-full bg-white px-8 py-3 text-sm font-semibold text-gray-800 shadow-lg hover:bg-gray-50 transition"
            >
              <GoogleIcon />
              Get started with Google
            </button>
            <button
              onClick={signInWithFacebook}
              className="flex items-center justify-center gap-3 rounded-full bg-[#1877F2] border-2 border-white/30 px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#166FE5] transition"
            >
              <FacebookIcon />
              Continue with Facebook
            </button>
          </div>
          <p className="text-xs text-primary-200 mt-4">Free to join. No credit card required.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-3 gap-6 text-center">
          {[
            { value: "10,000+", label: "Registered Profiles" },
            { value: "2,500+", label: "Successful Marriages" },
            { value: "50+", label: "Countries Represented" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-primary-600">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Soul Sangam?</h2>
            <p className="text-gray-500 mt-2">Everything you need to find the right person</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Success Stories</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, text, location }) => (
              <div key={name} className="card p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">"{text}"</p>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{name}</div>
                  <div className="text-xs text-gray-400">{location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-gray-500 mb-8">
            Join thousands of families who have found happiness through Soul Sangam.
          </p>
          <button
            onClick={signInWithGoogle}
            className="btn-primary px-10 py-3 text-base"
          >
            <Heart size={18} fill="currentColor" />
            Find My Match
          </button>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 px-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Soul Sangam. All rights reserved.
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z"/>
    </svg>
  );
}
