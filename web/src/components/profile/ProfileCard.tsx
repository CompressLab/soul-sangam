"use client";

import Link from "next/link";
import Image from "next/image";
import type { UserProfile } from "@shared/types";
import { MapPin, Heart, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

interface Props {
  profile: UserProfile;
}

export function ProfileCard({ profile }: Props) {
  const { user }           = useAuth();
  const [liked, setLiked]  = useState(false);
  const [hover, setHover]  = useState(false);
  const photo = profile.photos?.[0] ?? profile.photoURL;

  async function quickInterest(e: React.MouseEvent) {
    e.preventDefault();
    if (!user || liked) return;
    setLiked(true);
    try {
      await addDoc(collection(db, "interests"), {
        fromUid: user.uid, toUid: profile.uid,
        status: "pending", createdAt: Date.now(), updatedAt: Date.now(),
      });
      toast.success(`Interest sent to ${profile.displayName}!`);
    } catch {
      setLiked(false);
      toast.error("Failed to send interest.");
    }
  }

  return (
    <Link
      href={`/profile/view?uid=${profile.uid}`}
      className="group block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={`rounded-2xl overflow-hidden transition-all duration-300 border
        ${hover ? "shadow-lift -translate-y-1 border-primary-200" : "shadow-card border-white/60"}
        bg-white`}>

        {/* Photo */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
          {photo ? (
            <Image
              src={photo}
              alt={profile.displayName}
              fill
              className={`object-cover transition-transform duration-500 ${hover ? "scale-105" : "scale-100"}`}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl opacity-20">👤</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Like button */}
          {user && user.uid !== profile.uid && (
            <button
              onClick={quickInterest}
              aria-label="Send interest"
              className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200
                ${liked
                  ? "bg-gradient-to-br from-primary-500 to-violet-500 shadow-glow scale-110"
                  : "bg-white/90 hover:bg-white hover:scale-110"
                }`}
            >
              <Heart
                size={15}
                className={liked ? "text-white" : "text-slate-400"}
                fill={liked ? "white" : "none"}
              />
            </button>
          )}

          {/* Verified */}
          {profile.verified && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
              <CheckCircle size={10} />
              Verified
            </div>
          )}

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <p className="font-bold text-sm truncate">{profile.displayName}</p>
            <p className="text-xs text-white/75">{profile.age} yrs</p>
          </div>
        </div>

        {/* Info strip */}
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin size={11} className="text-primary-400 flex-shrink-0" />
            <span className="truncate">{profile.location?.city}, {profile.location?.country}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {[
              profile.religion ? profile.religion.charAt(0).toUpperCase() + profile.religion.slice(1) : null,
              profile.occupation,
            ].filter(Boolean).map((tag) => (
              <span key={tag} className="tag text-[10px]">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
