"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  doc, getDoc, addDoc, collection,
  query, where, getDocs, updateDoc,
} from "firebase/firestore";
import { db } from "@shared/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { UserProfile, Interest } from "@shared/types";
import { formatHeight } from "@shared/utils/age";
import {
  Heart, MessageCircle, MapPin, Briefcase,
  BookOpen, ArrowLeft, Check, X, Clock,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProfileViewInner() {
  useRequireAuth();
  const { user }     = useAuth();
  const searchParams = useSearchParams();
  const uid          = searchParams.get("uid");
  const router       = useRouter();

  const [profile,  setProfile]  = useState<UserProfile | null>(null);
  const [interest, setInterest] = useState<Interest | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  const isOwnProfile = user?.uid === uid;

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) setProfile(snap.data() as UserProfile);

        if (user && !isOwnProfile) {
          const outQ = query(collection(db, "interests"), where("fromUid", "==", user.uid), where("toUid", "==", uid));
          const outSnap = await getDocs(outQ);
          if (!outSnap.empty) {
            setInterest({ id: outSnap.docs[0].id, ...outSnap.docs[0].data() } as Interest);
          } else {
            const inQ = query(collection(db, "interests"), where("fromUid", "==", uid), where("toUid", "==", user.uid));
            const inSnap = await getDocs(inQ);
            if (!inSnap.empty)
              setInterest({ id: inSnap.docs[0].id, ...inSnap.docs[0].data() } as Interest);
          }
        }
      } catch (err) {
        console.error("ProfileView load error:", err);
        toast.error("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [uid, user, isOwnProfile]);

  async function sendInterest() {
    if (!user || !profile) return;
    setSending(true);
    try {
      const now = Date.now();
      const ref = await addDoc(collection(db, "interests"), {
        fromUid: user.uid, toUid: profile.uid, status: "pending", createdAt: now, updatedAt: now,
      });
      setInterest({ id: ref.id, fromUid: user.uid, toUid: profile.uid, status: "pending", createdAt: now, updatedAt: now });
      toast.success(`Interest sent to ${profile.displayName}!`);
    } catch { toast.error("Failed to send interest."); }
    finally { setSending(false); }
  }

  async function respond(status: "accepted" | "declined") {
    if (!interest) return;
    try {
      await updateDoc(doc(db, "interests", interest.id), { status, updatedAt: Date.now() });
      setInterest((p) => p ? { ...p, status } : p);
      toast.success(status === "accepted" ? "Interest accepted!" : "Declined.");
    } catch {
      toast.error("Failed to update. Please try again.");
    }
  }

  async function startChat() {
    if (!user || !profile) return;
    try {
      const q    = query(collection(db, "conversations"), where("participants", "array-contains", user.uid));
      const snap = await getDocs(q);
      const existing = snap.docs.find((d) => (d.data().participants as string[]).includes(profile.uid));
      if (existing) { router.push(`/chat/conversation?id=${existing.id}`); return; }
      const now = Date.now();
      const ref = await addDoc(collection(db, "conversations"), {
        participants: [user.uid, profile.uid], lastMessage: "", lastMessageAt: now,
        unreadCount: { [user.uid]: 0, [profile.uid]: 0 },
      });
      router.push(`/chat/conversation?id=${ref.id}`);
    } catch {
      toast.error("Failed to start chat. Please try again.");
    }
  }

  if (!uid) return (
    <div className="text-center py-20 text-gray-400">
      <Link href="/browse" className="btn-primary inline-flex">Browse Profiles</Link>
    </div>
  );

  if (loading) return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-4">
      <div className="h-96 rounded-2xl bg-gray-200" />
      <div className="h-6 w-48 rounded bg-gray-200" />
    </div>
  );

  if (!profile) return (
    <div className="text-center py-20 text-gray-400">
      <p className="text-lg font-medium">Profile not found</p>
      <Link href="/browse" className="btn-primary mt-4 inline-flex">Back to Browse</Link>
    </div>
  );

  const photos = profile.photos?.length ? profile.photos : [profile.photoURL].filter(Boolean) as string[];
  const isOutgoing = interest?.fromUid === user?.uid;
  const isIncoming = interest?.fromUid === uid;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="btn-ghost mb-4">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-2 space-y-2">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
            {photos.length > 0
              ? <Image src={photos[photoIdx]} alt={profile.displayName} fill className="object-cover" unoptimized />
              : <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">👤</div>}
          </div>
          {photos.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {photos.map((src, i) => (
                <button key={i} onClick={() => setPhotoIdx(i)}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${i === photoIdx ? "border-primary-500" : "border-transparent"}`}>
                  <Image src={src} alt="" width={56} height={56} className="object-cover w-full h-full" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="md:col-span-3 space-y-5">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  {profile.age} yrs · {profile.maritalStatus.replace("_", " ")} · {formatHeight(profile.height)}
                </p>
              </div>
              {profile.verified && (
                <span className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  <Check size={12} /> Verified
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {[profile.religion.charAt(0).toUpperCase() + profile.religion.slice(1), profile.caste, profile.motherTongue, profile.nationality]
                .filter(Boolean).map((tag) => (
                  <span key={tag} className="bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow icon={MapPin}    label="Location"   value={`${profile.location.city}, ${profile.location.country}`} />
            <InfoRow icon={Briefcase} label="Occupation" value={profile.occupation} />
            <InfoRow icon={BookOpen}  label="Education"  value={profile.education} />
            {profile.annualIncome && <InfoRow icon={Briefcase} label="Income" value={profile.annualIncome} />}
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
          </div>
          {profile.hobbies?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Hobbies</h3>
              <div className="flex flex-wrap gap-2">
                {profile.hobbies.map((h) => (
                  <span key={h} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">{h}</span>
                ))}
              </div>
            </div>
          )}
          {!isOwnProfile && (
            <div className="flex gap-3 pt-2">
              {!interest && (
                <button onClick={sendInterest} disabled={sending} className="btn-primary">
                  <Heart size={15} fill="currentColor" />{sending ? "Sending…" : "Send Interest"}
                </button>
              )}
              {interest && isOutgoing && (
                <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold
                  ${interest.status === "accepted" ? "bg-green-100 text-green-700"
                  : interest.status === "declined" ? "bg-red-100 text-red-600" : "bg-amber-50 text-amber-700"}`}>
                  {interest.status === "accepted" && <><Check size={14} /> Accepted</>}
                  {interest.status === "declined" && <><X size={14} /> Declined</>}
                  {interest.status === "pending"  && <><Clock size={14} /> Interest Sent</>}
                </div>
              )}
              {interest && isIncoming && interest.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => respond("accepted")} className="flex items-center gap-1.5 bg-green-100 text-green-700 rounded-full px-4 py-2 text-sm font-semibold hover:bg-green-200 transition">
                    <Check size={14} /> Accept
                  </button>
                  <button onClick={() => respond("declined")} className="flex items-center gap-1.5 bg-red-50 text-red-600 rounded-full px-4 py-2 text-sm font-semibold hover:bg-red-100 transition">
                    <X size={14} /> Decline
                  </button>
                </div>
              )}
              {interest?.status === "accepted" && (
                <button onClick={startChat} className="btn-outline">
                  <MessageCircle size={15} /> Message
                </button>
              )}
            </div>
          )}
          {isOwnProfile && (
            <Link href="/profile/edit" className="btn-outline inline-flex">Edit Profile</Link>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-primary-500 mt-0.5 flex-shrink-0" />
      <div>
        <div className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</div>
        <div className="text-sm text-gray-800 font-medium">{value}</div>
      </div>
    </div>
  );
}
