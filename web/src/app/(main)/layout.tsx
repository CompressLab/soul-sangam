"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Heart, Search, MessageCircle, User, Star, LogOut } from "lucide-react";
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
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/browse" className="flex items-center gap-1.5">
            <Heart className="text-primary-600" size={22} fill="currentColor" />
            <span className="font-bold text-primary-700 text-lg">Nikkah Connect</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition
                  ${pathname.startsWith(href)
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>

          {/* User avatar + logout */}
          <div className="flex items-center gap-3">
            {user?.photoURL && (
              <Image
                src={user.photoURL}
                alt={user.displayName ?? "User"}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            )}
            <button
              onClick={logout}
              className="btn-ghost text-gray-500"
              title="Sign out"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-40">
        <div className="grid grid-cols-4 h-16">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition
                ${pathname.startsWith(href)
                  ? "text-primary-600"
                  : "text-gray-500"
                }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
