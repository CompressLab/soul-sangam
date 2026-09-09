"use client";

import { useEffect, useState } from "react";
import {
  collection, query, where, getDocs,
  doc, getDoc, updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { Interest, UserProfile } from "@shared/types";
import { Heart, Check, X, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

type Tab = "received" | "sent" | "accepted";

interface InterestWithProfile extends Interest {
  profile: UserProfile;
}

export default function MatchesPage() {
  useRequireAuth();
  const { user } = useAuth();

  const [tab,      setTab]      = useState<Tab>("received");
  const [items,    setItems]    = useState<InterestWithProfile[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user) return;
    loadInterests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tab]);

  async function loadInterests() {
    if (!user) return;
    setLoading(true);
    setItems([]);

    try {
      let q;
      if (tab === "received") {
        q = query(collection(db, "interests"), where("toUid",   "==", user.uid), where("status", "==", "pending"));
      } else if (tab === "sent") {
        q = query(collection(db, "interests"), where("fromUid", "==", user.uid), where("status", "==", "pending"));
      } else {
        // accepted — both directions
        const [r1, r2] = await Promise.all([
          getDocs(query(collection(db, "interests"), where("toUid",   "==", user.uid), where("status", "==", "accepted"))),
          getDocs(query(collection(db, "interests"), where("fromUid", "==", user.uid), where("status", "==", "accepted"))),
        ]);
        const allDocs = [...r1.docs, ...r2.docs].map((d) => ({ id: d.id, ...d.data() } as Interest));
        const enriched = await enrichWithProfiles(allDocs, user.uid);
        setItems(enriched);
        setLoading(false);
        return;
      }

      const snap = await getDocs(q!);
      const interests = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Interest));
      const enriched  = await enrichWithProfiles(interests, user.uid);
      setItems(enriched);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function enrichWithProfiles(interests: Interest[], myUid: string): Promise<InterestWithProfile[]> {
    const results: InterestWithProfile[] = [];
    for (const interest of interests) {
      const otherUid = interest.fromUid === myUid ? interest.toUid : interest.fromUid;
      const snap = await getDoc(doc(db, "users", otherUid));
      if (snap.exists()) {
        results.push({ ...interest, profile: snap.data() as UserProfile });
      }
    }
    return results;
  }

  async function respond(interestId: string, status: "accepted" | "declined") {
    try {
      await updateDoc(doc(db, "interests", interestId), { status, updatedAt: Date.now() });
      toast.success(status === "accepted" ? "Interest accepted! You can now chat." : "Interest declined.");
      loadInterests();
    } catch {
      toast.error("Failed to update. Try again.");
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "received", label: "Received" },
    { key: "sent",     label: "Sent" },
    { key: "accepted", label: "Matches" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Matches & Interests</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your connections</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1.5 w-fit mb-6 shadow-inner">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200
              ${tab === key
                ? "bg-white text-primary-700 shadow-card border border-primary-100"
                : "text-slate-500 hover:text-slate-700"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl h-24 animate-pulse bg-gradient-to-br from-slate-100 to-slate-200" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-violet-100 flex items-center justify-center mx-auto mb-4">
            <Heart size={28} className="text-primary-400" />
          </div>
          <p className="font-bold text-slate-700">
            {tab === "received" ? "No new interests received yet"
             : tab === "sent"   ? "You haven't sent any interests yet"
             : "No mutual matches yet"}
          </p>
          {tab !== "received" && (
            <Link href="/browse" className="btn-primary mt-4 inline-flex text-sm">
              Browse Profiles
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <InterestCard
              key={item.id}
              item={item}
              tab={tab}
              onRespond={respond}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InterestCard({
  item,
  tab,
  onRespond,
}: {
  item: InterestWithProfile;
  tab: Tab;
  onRespond: (id: string, status: "accepted" | "declined") => void;
}) {
  const { profile } = item;
  const photo = profile.photos?.[0] ?? profile.photoURL;

  return (
    <div className="card-gradient p-4 flex items-center gap-4 hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200">
      <Link href={`/profile/view?uid=${profile.uid}`} className="flex-shrink-0">
        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-100 to-violet-100 shadow-sm">
          {photo ? (
            <Image src={photo} alt={profile.displayName} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/profile/view?uid=${profile.uid}`} className="font-bold text-slate-900 hover:text-primary-600 truncate block text-sm transition-colors">
          {profile.displayName}
        </Link>
        <p className="text-xs text-slate-500 mt-0.5">
          {profile.age} · {profile.location?.city}
        </p>

        {tab === "received" && (
          <div className="flex gap-2 mt-2.5">
            <button
              onClick={() => onRespond(item.id, "accepted")}
              className="flex items-center gap-1 bg-green-100 text-green-700 rounded-xl px-3 py-1.5 text-xs font-bold hover:bg-green-200 transition-all duration-200 shadow-sm"
            >
              <Check size={12} /> Accept
            </button>
            <button
              onClick={() => onRespond(item.id, "declined")}
              className="flex items-center gap-1 bg-red-50 text-red-600 rounded-xl px-3 py-1.5 text-xs font-bold hover:bg-red-100 transition-all duration-200"
            >
              <X size={12} /> Decline
            </button>
          </div>
        )}

        {tab === "sent" && (
          <span className="flex items-center gap-1 mt-1 text-xs text-amber-600">
            <Clock size={11} /> Awaiting response
          </span>
        )}

        {tab === "accepted" && (
          <Link
            href={`/chat`}
            className="flex items-center gap-1 mt-1 text-xs text-primary-600 font-medium hover:underline"
          >
            <Heart size={11} fill="currentColor" /> Mutual match · Start chatting
          </Link>
        )}
      </div>
    </div>
  );
}
