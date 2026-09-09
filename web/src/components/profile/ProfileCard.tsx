"use client";

import Link from "next/link";
import Image from "next/image";
import type { UserProfile } from "@shared/types";
import { MapPin, Heart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@shared/firebase/config";
import toast from "react-hot-toast";

interface Props {
  profile: UserProfile;
}

export function ProfileCard({ profile }: Props) {
  const { user }      = useAuth();
  const [liked, setLiked] = useState(false);
  const photo = profile.photos?.[0] ?? profile.photoURL;

  async function quickInterest(e: React.MouseEvent) {
    e.preventDefault();
    if (!user || liked) return;
    setLiked(true);
    try {
      await addDoc(collection(db, "interests"), {
        fromUid:   user.uid,
        toUid:     profile.uid,
        status:    "pending",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      toast.success(`Interest sent to ${profile.displayName}!`);
    } catch {
      setLiked(false);
      toast.error("Failed to send interest.");
    }
  }

  return (
    <Link
      href={`/profile/${profile.uid}`}
      className="card group overflow-hidden hover:shadow-md transition-shadow block"
    >
      {/* Photo */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={profile.displayName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">
            👤
          </div>
        )}

        {/* Quick like button */}
        {user && user.uid !== profile.uid && (
          <button
            onClick={quickInterest}
            aria-label="Send interest"
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition
              ${liked
                ? "bg-primary-600 text-white"
                : "bg-white/80 text-gray-500 hover:bg-white hover:text-primary-600"
              }`}
          >
            <Heart size={15} fill={liked ? "currentColor" : "none"} />
          </button>
        )}

        {/* Verified badge */}
        {profile.verified && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            ✓ Verified
          </span>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <p className="font-semibold text-sm truncate">{profile.displayName}</p>
          <p className="text-xs text-white/80">{profile.age} yrs</p>
        </div>
      </div>

      {/* Info strip */}
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={11} className="text-primary-400 flex-shrink-0" />
          <span className="truncate">{profile.location.city}, {profile.location.country}</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {[
            profile.religion.charAt(0).toUpperCase() + profile.religion.slice(1),
            profile.occupation,
          ].map((tag) => (
            <span key={tag} className="text-[10px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
