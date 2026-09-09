"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { Conversation, UserProfile } from "@shared/types";
import toast from "react-hot-toast";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface ConvWithProfile extends Conversation {
  otherProfile: UserProfile | null;
}

export default function ChatListPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [convs,   setConvs]   = useState<ConvWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      async (snap) => {
        try {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
          const enriched: ConvWithProfile[] = await Promise.allSettled(
            docs.map(async (conv) => {
              const otherUid = conv.participants.find((p) => p !== user.uid);
              if (!otherUid) return { ...conv, otherProfile: null };
              const uSnap = await getDoc(doc(db, "users", otherUid));
              return { ...conv, otherProfile: uSnap.exists() ? (uSnap.data() as UserProfile) : null };
            })
          ).then((results) =>
            results
              .filter((r): r is PromiseFulfilledResult<ConvWithProfile> => r.status === "fulfilled")
              .map((r) => r.value)
          );
          setConvs(enriched);
        } catch (err) {
          console.error("Chat list error:", err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Chat onSnapshot error:", err);
        toast.error("Failed to load messages.");
        setLoading(false);
      }
    );

    return unsub;
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-2xl h-20 animate-pulse bg-gradient-to-br from-slate-100 to-slate-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Messages</h1>
        <p className="text-sm text-slate-500 mt-1">Your private conversations</p>
      </div>

      {convs.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-violet-100 flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={28} className="text-primary-400" />
          </div>
          <p className="font-bold text-slate-700">No conversations yet</p>
          <p className="text-sm text-slate-400 mt-1">Accept or receive an interest to start chatting</p>
          <Link href="/matches" className="btn-primary mt-5 inline-flex text-sm">
            View Matches
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {convs.map((conv) => {
            const p    = conv.otherProfile;
            const photo = p?.photos?.[0] ?? p?.photoURL;
            const unread = user ? (conv.unreadCount?.[user.uid] ?? 0) : 0;

            return (
              <Link
                key={conv.id}
                href={`/chat/conversation?id=${conv.id}`}
                className="card-gradient p-4 flex items-center gap-4 hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200 block"
              >
                <div className="relative flex-shrink-0 w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-100 to-violet-100 shadow-sm">
                  {photo ? (
                    <Image src={photo} alt={p?.displayName ?? ""} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                  )}
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-primary-500 to-violet-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                      {unread}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-sm truncate ${unread > 0 ? "text-slate-900" : "text-slate-700"}`}>
                      {p?.displayName ?? "Unknown"}
                    </span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                      {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${unread > 0 ? "text-slate-800 font-semibold" : "text-slate-400"}`}>
                    {conv.lastMessage || "Say hello!"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
