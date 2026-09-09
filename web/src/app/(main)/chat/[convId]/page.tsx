"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, doc, getDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@shared/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { Message, Conversation, UserProfile } from "@shared/types";
import { ArrowLeft, Send } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

export default function ConversationPage() {
  useRequireAuth();
  const { user }   = useAuth();
  const { convId } = useParams<{ convId: string }>();
  const router     = useRouter();

  const [messages,      setMessages]      = useState<Message[]>([]);
  const [conv,          setConv]          = useState<Conversation | null>(null);
  const [otherProfile,  setOtherProfile]  = useState<UserProfile | null>(null);
  const [text,          setText]          = useState("");
  const [sending,       setSending]       = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load conversation metadata
  useEffect(() => {
    if (!convId || !user) return;
    (async () => {
      const snap = await getDoc(doc(db, "conversations", convId));
      if (!snap.exists()) { router.replace("/chat"); return; }
      const convData = snap.data() as Conversation;
      setConv(convData);
      const otherUid = convData.participants.find((p) => p !== user.uid);
      if (otherUid) {
        const uSnap = await getDoc(doc(db, "users", otherUid));
        if (uSnap.exists()) setOtherProfile(uSnap.data() as UserProfile);
      }
      // Mark messages as read
      await updateDoc(doc(db, "conversations", convId), {
        [`unreadCount.${user.uid}`]: 0,
      });
    })();
  }, [convId, user, router]);

  // Real-time messages
  useEffect(() => {
    if (!convId) return;
    const q = query(
      collection(db, "conversations", convId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));
    });
    return unsub;
  }, [convId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !user || !convId) return;
    setSending(true);
    const content = text.trim();
    setText("");

    try {
      const now = Date.now();
      await addDoc(collection(db, "conversations", convId, "messages"), {
        convId,
        senderUid: user.uid,
        text:      content,
        createdAt: now,
        read:      false,
      });

      const otherUid = conv?.participants.find((p) => p !== user.uid);
      await updateDoc(doc(db, "conversations", convId), {
        lastMessage:   content,
        lastMessageAt: now,
        ...(otherUid ? { [`unreadCount.${otherUid}`]: (conv?.unreadCount?.[otherUid] ?? 0) + 1 } : {}),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  const otherPhoto = otherProfile?.photos?.[0] ?? otherProfile?.photoURL;

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="card px-4 py-3 flex items-center gap-3 mb-3 flex-shrink-0">
        <button onClick={() => router.back()} className="btn-ghost p-1.5">
          <ArrowLeft size={18} />
        </button>
        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          {otherPhoto ? (
            <Image src={otherPhoto} alt={otherProfile?.displayName ?? ""} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
          )}
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">{otherProfile?.displayName ?? "…"}</p>
          <p className="text-xs text-gray-500">{otherProfile?.location.city}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-4">
        {messages.map((msg) => {
          const isMine = msg.senderUid === user?.uid;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${isMine
                    ? "bg-primary-600 text-white rounded-br-sm"
                    : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
                  }`}
              >
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 ${isMine ? "text-primary-200" : "text-gray-400"}`}>
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            Say hello to {otherProfile?.displayName ?? "your match"}! 👋
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="card px-4 py-3 flex gap-3 items-center flex-shrink-0">
        <input
          className="input flex-1"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={sending}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="btn-primary rounded-full w-10 h-10 p-0 flex items-center justify-center flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
