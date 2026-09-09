"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Heart, Search, MessageCircle, User, LogOut, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const navItems = [
  { href: "/browse",  label: "Browse",  icon: Search },
  { href: "/matches", label: "Matches", icon: Heart },
  { href: "/chat",    label: "Chat",    icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  useRequireAuth();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-15 flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/browse" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center shadow-md">
              <Heart size={14} className="text-white" fill="white" />
            </div>
            <span className="font-bold gradient-text text-lg">Soul Sangam</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${active
                      ? "bg-gradient-to-r from-primary-50 to-violet-50 text-primary-700 shadow-sm border border-primary-100"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                >
                  <Icon size={15} className={active ? "text-primary-600" : ""} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="flex items-center gap-2">
            {user?.photoURL && (
              <div className="relative">
                <Image
                  src={user.photoURL}
                  alt={user.displayName ?? "User"}
                  width={32}
                  height={32}
                  className="rounded-full object-cover ring-2 ring-primary-100"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
            )}
            <button
              onClick={logout}
              className="btn-ghost text-slate-400 hover:text-red-500 px-2.5 py-2"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-100">
        <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all duration-200
                  ${active ? "text-primary-700" : "text-slate-400"}`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${active ? "bg-primary-50" : ""}`}>
                  <Icon size={19} className={active ? "text-primary-600" : ""} />
                </div>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
