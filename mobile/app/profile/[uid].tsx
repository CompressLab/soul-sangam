import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Image,
  FlatList, ActivityIndicator,
} from "react-native";
import {
  doc, getDoc, addDoc, collection,
  query, where, getDocs, updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { UserProfile, Interest } from "@shared/types";
import { formatHeight } from "@shared/utils/age";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import {
  MapPin, Briefcase, BookOpen,
  Heart, MessageCircle, Check, X, Clock,
} from "lucide-react-native";
import { colors, spacing, radius, typography } from "@/constants/theme";

export default function ProfileViewScreen() {
  const { user }  = useAuth();
  const { uid }   = useLocalSearchParams<{ uid: string }>();

  const [profile,   setProfile]   = useState<UserProfile | null>(null);
  const [interest,  setInterest]  = useState<Interest | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [acting,    setActing]    = useState(false);
  const [photoIdx,  setPhotoIdx]  = useState(0);

  const isOwn = user?.uid === uid;

  useEffect(() => {
    if (!uid || !user) return;
    (async () => {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) setProfile(snap.data() as UserProfile);

      if (!isOwn) {
        const outQ = query(collection(db, "interests"), where("fromUid", "==", user.uid), where("toUid", "==", uid));
        const outS = await getDocs(outQ);
        if (!outS.empty) { setInterest({ id: outS.docs[0].id, ...outS.docs[0].data() } as Interest); }
        else {
          const inQ = query(collection(db, "interests"), where("fromUid", "==", uid), where("toUid", "==", user.uid));
          const inS = await getDocs(inQ);
          if (!inS.empty) setInterest({ id: inS.docs[0].id, ...inS.docs[0].data() } as Interest);
        }
      }
      setLoading(false);
    })();
  }, [uid, user, isOwn]);

  async function sendInterest() {
    if (!user || !profile) return;
    setActing(true);
    try {
      const now = Date.now();
      const ref = await addDoc(collection(db, "interests"), {
        fromUid: user.uid, toUid: profile.uid, status: "pending", createdAt: now, updatedAt: now,
      });
      setInterest({ id: ref.id, fromUid: user.uid, toUid: profile.uid, status: "pending", createdAt: now, updatedAt: now });
      Toast.show({ type: "success", text1: `Interest sent to ${profile.displayName}!` });
    } catch { Toast.show({ type: "error", text1: "Failed. Try again." }); }
    finally { setActing(false); }
  }

  async function respond(status: "accepted" | "declined") {
    if (!interest) return;
    setActing(true);
    await updateDoc(doc(db, "interests", interest.id), { status, updatedAt: Date.now() });
    setInterest((p) => p ? { ...p, status } : p);
    Toast.show({ type: "success", text1: status === "accepted" ? "Interest accepted!" : "Declined." });
    setActing(false);
  }

  async function startChat() {
    if (!user || !profile) return;
    const q    = query(collection(db, "conversations"), where("participants", "array-contains", user.uid));
    const snap = await getDocs(q);
    const existing = snap.docs.find((d) => (d.data().participants as string[]).includes(profile.uid));
    if (existing) { router.push(`/chat/${existing.id}`); return; }
    const now = Date.now();
    const ref = await addDoc(collection(db, "conversations"), {
      participants: [user.uid, profile.uid], lastMessage: "", lastMessageAt: now,
      unreadCount: { [user.uid]: 0, [profile.uid]: 0 },
    });
    router.push(`/chat/${ref.id}`);
  }

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} size="large" />
    </SafeAreaView>
  );

  if (!profile) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={typography.body}>Profile not found.</Text>
      </View>
    </SafeAreaView>
  );

  const photos = profile.photos?.length ? profile.photos : (profile.photoURL ? [profile.photoURL] : []);
  const isOutgoing = interest?.fromUid === user?.uid;
  const isIncoming = interest?.fromUid === uid;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Main photo */}
        <View style={styles.photoContainer}>
          {photos.length > 0
            ? <Image source={{ uri: photos[photoIdx] }} style={styles.mainPhoto} />
            : <View style={[styles.mainPhoto, styles.noPhoto]}><Text style={{ fontSize: 60 }}>👤</Text></View>
          }
          {profile.verified && (
            <View style={styles.verifiedBadge}>
              <Check size={11} color={colors.white} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <FlatList
            horizontal data={photos} keyExtractor={(u, i) => `${i}`}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbRow}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => setPhotoIdx(index)}>
                <Image source={{ uri: item }} style={[styles.thumb, index === photoIdx && styles.thumbActive]} />
              </TouchableOpacity>
            )}
          />
        )}

        {/* Info */}
        <View style={styles.body}>
          <Text style={styles.name}>{profile.displayName}</Text>
          <Text style={styles.meta}>
            {profile.age} yrs · {profile.maritalStatus.replace("_", " ")} · {formatHeight(profile.height)}
          </Text>

          {/* Tags */}
          <View style={styles.tags}>
            {[
              profile.religion.charAt(0).toUpperCase() + profile.religion.slice(1),
              profile.caste, profile.motherTongue, profile.nationality,
            ].filter(Boolean).map((t) => (
              <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
            ))}
          </View>

          {/* Quick facts */}
          <View style={styles.card}>
            <InfoRow icon={MapPin}    label="Location"   value={`${profile.location.city}, ${profile.location.country}`} />
            <InfoRow icon={Briefcase} label="Occupation" value={profile.occupation} />
            <InfoRow icon={BookOpen}  label="Education"  value={profile.education} />
          </View>

          {/* Bio */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>

          {/* Hobbies */}
          {profile.hobbies?.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Hobbies</Text>
              <View style={styles.tags}>
                {profile.hobbies.map((h) => (
                  <View key={h} style={[styles.tag, { backgroundColor: colors.gray100 }]}>
                    <Text style={[styles.tagText, { color: colors.gray700 }]}>{h}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action bar */}
      {!isOwn && (
        <View style={styles.actionBar}>
          {!interest && (
            <TouchableOpacity style={styles.primaryAction} onPress={sendInterest} disabled={acting}>
              {acting
                ? <ActivityIndicator color={colors.white} size="small" />
                : <><Heart size={16} color={colors.white} fill={colors.white} /><Text style={styles.primaryActionText}>Send Interest</Text></>
              }
            </TouchableOpacity>
          )}

          {interest && isOutgoing && (
            <View style={[styles.statusPill,
              interest.status === "accepted" ? styles.statusAccepted :
              interest.status === "declined" ? styles.statusDeclined : styles.statusPending]}>
              {interest.status === "accepted" && <><Check size={14} color={colors.green} /><Text style={[styles.statusText, { color: colors.green }]}>Accepted</Text></>}
              {interest.status === "declined" && <><X size={14} color={colors.red} /><Text style={[styles.statusText, { color: colors.red }]}>Declined</Text></>}
              {interest.status === "pending"  && <><Clock size={14} color={colors.amber} /><Text style={[styles.statusText, { color: colors.amber }]}>Interest Sent</Text></>}
            </View>
          )}

          {interest && isIncoming && interest.status === "pending" && (
            <View style={styles.respondRow}>
              <TouchableOpacity style={styles.acceptBtn} onPress={() => respond("accepted")} disabled={acting}>
                <Check size={16} color={colors.green} /><Text style={[styles.statusText, { color: colors.green }]}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.declineBtn} onPress={() => respond("declined")} disabled={acting}>
                <X size={16} color={colors.red} /><Text style={[styles.statusText, { color: colors.red }]}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}

          {interest?.status === "accepted" && (
            <TouchableOpacity style={styles.chatBtn} onPress={startChat}>
              <MessageCircle size={16} color={colors.primary} />
              <Text style={styles.chatBtnText}>Message</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 4 }}>
      <Icon size={14} color={colors.primary} style={{ marginTop: 2 }} />
      <View>
        <Text style={{ fontSize: 10, color: colors.gray400, textTransform: "uppercase" }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.gray900 }}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: colors.white },
  center:         { flex: 1, alignItems: "center", justifyContent: "center" },
  photoContainer: { position: "relative" },
  mainPhoto:      { width: "100%", height: 380 },
  noPhoto:        { backgroundColor: colors.gray100, alignItems: "center", justifyContent: "center" },
  verifiedBadge:  { position: "absolute", bottom: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.green, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  verifiedText:   { color: colors.white, fontSize: 11, fontWeight: "700" },
  thumbRow:       { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: 8 },
  thumb:          { width: 56, height: 56, borderRadius: radius.md, borderWidth: 2, borderColor: "transparent" },
  thumbActive:    { borderColor: colors.primary },
  body:           { paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: spacing.md },
  name:           { fontSize: 24, fontWeight: "800", color: colors.gray900 },
  meta:           { fontSize: 13, color: colors.gray500 },
  tags:           { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag:            { backgroundColor: colors.primary50, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  tagText:        { fontSize: 11, fontWeight: "600", color: colors.primary },
  card:           { backgroundColor: colors.gray50, borderRadius: radius.lg, padding: spacing.md, gap: 4, borderWidth: 1, borderColor: colors.gray100 },
  sectionTitle:   { fontSize: 13, fontWeight: "700", color: colors.gray700, marginBottom: 4 },
  bio:            { fontSize: 13, color: colors.gray600, lineHeight: 21 },
  actionBar:      { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", gap: spacing.sm, padding: spacing.md, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray100 },
  primaryAction:  { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 13 },
  primaryActionText: { color: colors.white, fontWeight: "700", fontSize: 15 },
  statusPill:     { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: radius.full, paddingVertical: 13 },
  statusAccepted: { backgroundColor: "#dcfce7" },
  statusDeclined: { backgroundColor: "#fee2e2" },
  statusPending:  { backgroundColor: "#fef9c3" },
  statusText:     { fontSize: 13, fontWeight: "600" },
  respondRow:     { flex: 1, flexDirection: "row", gap: spacing.sm },
  acceptBtn:      { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#dcfce7", borderRadius: radius.full, paddingVertical: 13 },
  declineBtn:     { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#fee2e2", borderRadius: radius.full, paddingVertical: 13 },
  chatBtn:        { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.full, paddingVertical: 13, paddingHorizontal: 20 },
  chatBtnText:    { color: colors.primary, fontWeight: "700", fontSize: 14 },
});
