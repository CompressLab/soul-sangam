import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, FlatList, Image, ActivityIndicator,
} from "react-native";
import {
  collection, query, where, getDocs,
  doc, getDoc, updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Interest, UserProfile } from "@shared/types";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { Heart, Check, X, Clock } from "lucide-react-native";
import { colors, spacing, radius, typography } from "@/constants/theme";

type Tab = "received" | "sent" | "accepted";

interface InterestWithProfile extends Interest {
  profile: UserProfile;
}

export default function MatchesScreen() {
  const { user }                       = useAuth();
  const [tab,     setTab]              = useState<Tab>("received");
  const [items,   setItems]            = useState<InterestWithProfile[]>([]);
  const [loading, setLoading]          = useState(true);

  useEffect(() => { if (user) load(); }, [user, tab]);

  async function load() {
    if (!user) return;
    setLoading(true);
    setItems([]);
    try {
      let interests: Interest[] = [];
      if (tab === "received") {
        const snap = await getDocs(query(collection(db, "interests"), where("toUid", "==", user.uid), where("status", "==", "pending")));
        interests = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Interest));
      } else if (tab === "sent") {
        const snap = await getDocs(query(collection(db, "interests"), where("fromUid", "==", user.uid), where("status", "==", "pending")));
        interests = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Interest));
      } else {
        const [r1, r2] = await Promise.all([
          getDocs(query(collection(db, "interests"), where("toUid",   "==", user.uid), where("status", "==", "accepted"))),
          getDocs(query(collection(db, "interests"), where("fromUid", "==", user.uid), where("status", "==", "accepted"))),
        ]);
        interests = [...r1.docs, ...r2.docs].map((d) => ({ id: d.id, ...d.data() } as Interest));
      }

      const enriched: InterestWithProfile[] = [];
      for (const interest of interests) {
        const otherUid = interest.fromUid === user.uid ? interest.toUid : interest.fromUid;
        const snap = await getDoc(doc(db, "users", otherUid));
        if (snap.exists()) enriched.push({ ...interest, profile: snap.data() as UserProfile });
      }
      setItems(enriched);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function respond(interestId: string, status: "accepted" | "declined") {
    await updateDoc(doc(db, "interests", interestId), { status, updatedAt: Date.now() });
    Toast.show({ type: "success", text1: status === "accepted" ? "Interest accepted!" : "Interest declined" });
    load();
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "received", label: "Received" },
    { key: "sent",     label: "Sent" },
    { key: "accepted", label: "Matches" },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={[typography.h2, { paddingHorizontal: spacing.md, paddingTop: spacing.md }]}>
        Matches & Interests
      </Text>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setTab(key)}
            style={[styles.tabBtn, tab === key && styles.tabBtnActive]}
          >
            <Text style={[styles.tabLabel, tab === key && styles.tabLabelActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <InterestRow item={item} tab={tab} onRespond={respond} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Heart size={36} color={colors.gray200} />
              <Text style={styles.emptyText}>
                {tab === "received" ? "No interests received yet"
                 : tab === "sent"   ? "No interests sent yet"
                 : "No mutual matches yet"}
              </Text>
              {tab !== "received" && (
                <TouchableOpacity style={styles.browseBtn} onPress={() => router.push("/(tabs)/browse")}>
                  <Text style={styles.browseBtnText}>Browse Profiles</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function InterestRow({
  item, tab, onRespond,
}: { item: InterestWithProfile; tab: Tab; onRespond: (id: string, s: "accepted" | "declined") => void }) {
  const { profile } = item;
  const photo = profile.photos?.[0] ?? profile.photoURL;

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/profile/${profile.uid}`)}
    >
      <View style={styles.avatar}>
        {photo
          ? <Image source={{ uri: photo }} style={styles.avatarImg} />
          : <Text style={{ fontSize: 28 }}>👤</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{profile.displayName}</Text>
        <Text style={styles.meta}>{profile.age} · {profile.location.city}</Text>
        {tab === "received" && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => onRespond(item.id, "accepted")}>
              <Check size={13} color={colors.green} />
              <Text style={[styles.actionText, { color: colors.green }]}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.declineBtn} onPress={() => onRespond(item.id, "declined")}>
              <X size={13} color={colors.red} />
              <Text style={[styles.actionText, { color: colors.red }]}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
        {tab === "sent" && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
            <Clock size={12} color={colors.amber} />
            <Text style={{ fontSize: 11, color: colors.amber }}>Awaiting response</Text>
          </View>
        )}
        {tab === "accepted" && (
          <TouchableOpacity onPress={() => router.push("/(tabs)/chat")} style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: colors.primary, fontWeight: "600" }}>
              💌 Mutual match · Start chatting
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: colors.gray50 },
  tabRow:         { flexDirection: "row", marginHorizontal: spacing.md, marginVertical: spacing.md, backgroundColor: colors.gray100, borderRadius: radius.full, padding: 3 },
  tabBtn:         { flex: 1, paddingVertical: 8, borderRadius: radius.full, alignItems: "center" },
  tabBtnActive:   { backgroundColor: colors.white, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabLabel:       { fontSize: 13, fontWeight: "500", color: colors.gray500 },
  tabLabelActive: { color: colors.primary, fontWeight: "700" },
  list:           { paddingHorizontal: spacing.md, paddingBottom: 80, gap: spacing.sm },
  row:            { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.md, borderWidth: 1, borderColor: colors.gray100 },
  avatar:         { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.gray100, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImg:      { width: 56, height: 56 },
  name:           { fontSize: 15, fontWeight: "700", color: colors.gray900 },
  meta:           { fontSize: 12, color: colors.gray500, marginTop: 2 },
  actions:        { flexDirection: "row", gap: 8, marginTop: 6 },
  acceptBtn:      { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#dcfce7", paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full },
  declineBtn:     { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fee2e2", paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full },
  actionText:     { fontSize: 12, fontWeight: "600" },
  empty:          { alignItems: "center", paddingVertical: 60, gap: spacing.sm },
  emptyText:      { ...typography.body, color: colors.gray400, textAlign: "center" },
  browseBtn:      { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 20, paddingVertical: 10, marginTop: spacing.sm },
  browseBtnText:  { color: colors.white, fontWeight: "600", fontSize: 14 },
});
