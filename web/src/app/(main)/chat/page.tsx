"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@shared/firebase/config";
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
          <div key={i} className="card h-20 animate-pulse bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      {convs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MessageCircle size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="font-medium">No conversations yet</p>
          <p className="text-sm mt-1">Accept or receive an interest to start chatting</p>
          <Link href="/matches" className="btn-primary mt-4 inline-flex text-sm">
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
                className="card p-4 flex items-center gap-4 hover:shadow-md transition"
              >
                <div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  {photo ? (
                    <Image src={photo} alt={p?.displayName ?? ""} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                  )}
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold text-sm truncate ${unread > 0 ? "text-gray-900" : "text-gray-700"}`}>
                      {p?.displayName ?? "Unknown"}
                    </span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                      {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${unread > 0 ? "text-gray-800 font-medium" : "text-gray-500"}`}>
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
