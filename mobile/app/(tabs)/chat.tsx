import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, FlatList, Image, ActivityIndicator,
} from "react-native";
import {
  collection, query, where, onSnapshot,
  orderBy, doc, getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Conversation, UserProfile } from "@shared/types";
import { router } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react-native";
import { colors, spacing, radius, typography } from "@/constants/theme";

interface ConvWithProfile extends Conversation {
  otherProfile: UserProfile | null;
}

export default function ChatScreen() {
  const { user }                      = useAuth();
  const [convs,   setConvs]           = useState<ConvWithProfile[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageAt", "desc")
    );
    const unsub = onSnapshot(q, async (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
      const enriched: ConvWithProfile[] = await Promise.all(
        docs.map(async (conv) => {
          const otherUid = conv.participants.find((p) => p !== user.uid);
          if (!otherUid) return { ...conv, otherProfile: null };
          const uSnap = await getDoc(doc(db, "users", otherUid));
          return { ...conv, otherProfile: uSnap.exists() ? (uSnap.data() as UserProfile) : null };
        })
      );
      setConvs(enriched);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={[typography.h2, styles.heading]}>Messages</Text>

      {convs.length === 0 ? (
        <View style={styles.empty}>
          <MessageCircle size={44} color={colors.gray200} />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySub}>
            Accept or receive an interest to start chatting
          </Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.push("/(tabs)/matches")}>
            <Text style={styles.btnText}>View Matches</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={convs}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 80, gap: spacing.sm }}
          renderItem={({ item: conv }) => {
            const p     = conv.otherProfile;
            const photo = p?.photos?.[0] ?? p?.photoURL;
            const unread = user ? (conv.unreadCount?.[user.uid] ?? 0) : 0;

            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() => router.push(`/chat/${conv.id}`)}
              >
                <View style={styles.avatarWrap}>
                  {photo
                    ? <Image source={{ uri: photo }} style={styles.avatar} />
                    : <Text style={{ fontSize: 26 }}>👤</Text>}
                  {unread > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unread}</Text>
                    </View>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowTop}>
                    <Text style={[styles.name, unread > 0 && { fontWeight: "800" }]}>
                      {p?.displayName ?? "Unknown"}
                    </Text>
                    <Text style={styles.time}>
                      {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                    </Text>
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[styles.lastMsg, unread > 0 && { color: colors.gray900, fontWeight: "600" }]}
                  >
                    {conv.lastMessage || "Say hello! 👋"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.gray50 },
  heading:    { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  row:        { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.md, borderWidth: 1, borderColor: colors.gray100 },
  avatarWrap: { position: "relative", width: 50, height: 50, borderRadius: 25, backgroundColor: colors.gray100, alignItems: "center", justifyContent: "center", overflow: "visible" },
  avatar:     { width: 50, height: 50, borderRadius: 25 },
  badge:      { position: "absolute", top: -2, right: -2, backgroundColor: colors.primary, borderRadius: 8, width: 16, height: 16, alignItems: "center", justifyContent: "center" },
  badgeText:  { color: colors.white, fontSize: 10, fontWeight: "700" },
  rowTop:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name:       { fontSize: 14, fontWeight: "600", color: colors.gray900, flex: 1 },
  time:       { fontSize: 11, color: colors.gray400 },
  lastMsg:    { fontSize: 12, color: colors.gray500, marginTop: 2 },
  empty:      { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm, padding: spacing.xl },
  emptyTitle: { ...typography.h3, color: colors.gray400, textAlign: "center" },
  emptySub:   { ...typography.small, textAlign: "center" },
  btn:        { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 24, paddingVertical: 12, marginTop: spacing.sm },
  btnText:    { color: colors.white, fontWeight: "600", fontSize: 14 },
});
