"use client";

import { useState, useEffect } from "react";
import {
  collection, query, where, getDocs,
  addDoc, updateDoc, doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Interest, InterestStatus } from "@shared/types";
import { Heart, Check, X, Clock } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

interface Props {
  targetUid: string;
  /** Called when the status changes, e.g. to unlock chat */
  onStatusChange?: (status: InterestStatus | null) => void;
}

export function InterestButton({ targetUid, onStatusChange }: Props) {
  const { user } = useAuth();
  const [interest, setInterest] = useState<Interest | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Check outgoing interest (I sent)
      const outQ = query(
        collection(db, "interests"),
        where("fromUid", "==", user.uid),
        where("toUid",   "==", targetUid)
      );
      const outSnap = await getDocs(outQ);
      if (!outSnap.empty) {
        setInterest({ id: outSnap.docs[0].id, ...outSnap.docs[0].data() } as Interest);
        setLoading(false);
        return;
      }
      // Check incoming interest (they sent to me)
      const inQ = query(
        collection(db, "interests"),
        where("fromUid", "==", targetUid),
        where("toUid",   "==", user.uid)
      );
      const inSnap = await getDocs(inQ);
      if (!inSnap.empty) {
        setInterest({ id: inSnap.docs[0].id, ...inSnap.docs[0].data() } as Interest);
      }
      setLoading(false);
    })();
  }, [user, targetUid]);

  async function sendInterest() {
    if (!user) return;
    setActing(true);
    try {
      const now = Date.now();
      const docRef = await addDoc(collection(db, "interests"), {
        fromUid: user.uid, toUid: targetUid,
        status: "pending", createdAt: now, updatedAt: now,
      });
      const newInterest: Interest = {
        id: docRef.id, fromUid: user.uid, toUid: targetUid,
        status: "pending", createdAt: now, updatedAt: now,
      };
      setInterest(newInterest);
      onStatusChange?.("pending");
      toast.success("Interest sent!");
    } catch {
      toast.error("Failed to send interest. Try again.");
    } finally {
      setActing(false);
    }
  }

  async function respond(status: "accepted" | "declined") {
    if (!interest) return;
    setActing(true);
    try {
      await updateDoc(doc(db, "interests", interest.id), { status, updatedAt: Date.now() });
      setInterest((prev) => prev ? { ...prev, status } : prev);
      onStatusChange?.(status);
      toast.success(status === "accepted" ? "Interest accepted! You can now chat." : "Interest declined.");
    } catch {
      toast.error("Failed to update. Try again.");
    } finally {
      setActing(false);
    }
  }

  if (loading || !user) return null;

  const isOutgoing = interest?.fromUid === user.uid;
  const isIncoming = interest?.fromUid === targetUid;

  // No interest yet — show send button
  if (!interest) {
    return (
      <button
        onClick={sendInterest}
        disabled={acting}
        className="btn-primary"
      >
        <Heart size={15} fill="currentColor" />
        {acting ? "Sending…" : "Send Interest"}
      </button>
    );
  }

  // Outgoing — show status pill
  if (isOutgoing) {
    return (
      <div className={clsx(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
        interest.status === "accepted" && "bg-green-100 text-green-700",
        interest.status === "declined" && "bg-red-100 text-red-600",
        interest.status === "pending"  && "bg-amber-50 text-amber-700"
      )}>
        {interest.status === "accepted" && <><Check size={14} /> Accepted</>}
        {interest.status === "declined" && <><X size={14} /> Declined</>}
        {interest.status === "pending"  && <><Clock size={14} /> Interest Sent</>}
      </div>
    );
  }

  // Incoming pending — show accept/decline
  if (isIncoming && interest.status === "pending") {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => respond("accepted")}
          disabled={acting}
          className="flex items-center gap-1.5 bg-green-100 text-green-700 rounded-full
                     px-4 py-2 text-sm font-semibold hover:bg-green-200 transition disabled:opacity-50"
        >
          <Check size={14} /> Accept
        </button>
        <button
          onClick={() => respond("declined")}
          disabled={acting}
          className="flex items-center gap-1.5 bg-red-50 text-red-600 rounded-full
                     px-4 py-2 text-sm font-semibold hover:bg-red-100 transition disabled:opacity-50"
        >
          <X size={14} /> Decline
        </button>
      </div>
    );
  }

  // Incoming — already responded
  return (
    <div className={clsx(
      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
      interest.status === "accepted" && "bg-green-100 text-green-700",
      interest.status === "declined" && "bg-red-100 text-red-600",
    )}>
      {interest.status === "accepted" && <><Check size={14} /> Matched</>}
      {interest.status === "declined" && <><X size={14} /> Declined</>}
    </div>
  );
}
