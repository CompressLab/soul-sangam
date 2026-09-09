import { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, Image, ActivityIndicator,
} from "react-native";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, doc, getDoc, updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Message, Conversation, UserProfile } from "@shared/types";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { Send } from "lucide-react-native";
import { colors, spacing, radius, typography } from "@/constants/theme";

export default function ConversationScreen() {
  const { user }   = useAuth();
  const { convId } = useLocalSearchParams<{ convId: string }>();
  const navigation = useNavigation();

  const [messages,     setMessages]     = useState<Message[]>([]);
  const [conv,         setConv]         = useState<Conversation | null>(null);
  const [otherProfile, setOtherProfile] = useState<UserProfile | null>(null);
  const [text,         setText]         = useState("");
  const [sending,      setSending]      = useState(false);
  const listRef = useRef<FlatList>(null);

  // Load conversation + other user
  useEffect(() => {
    if (!convId || !user) return;
    (async () => {
      const snap = await getDoc(doc(db, "conversations", convId));
      if (!snap.exists()) return;
      const convData = snap.data() as Conversation;
      setConv(convData);
      const otherUid = convData.participants.find((p) => p !== user.uid);
      if (otherUid) {
        const uSnap = await getDoc(doc(db, "users", otherUid));
        if (uSnap.exists()) {
          const p = uSnap.data() as UserProfile;
          setOtherProfile(p);
          navigation.setOptions({ title: p.displayName });
        }
      }
      await updateDoc(doc(db, "conversations", convId), {
        [`unreadCount.${user.uid}`]: 0,
      });
    })();
  }, [convId, user]);

  // Real-time messages
  useEffect(() => {
    if (!convId) return;
    const q = query(
      collection(db, "conversations", convId, "messages"),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));
    });
  }, [convId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  async function send() {
    if (!text.trim() || !user || !convId) return;
    setSending(true);
    const content = text.trim();
    setText("");
    const now = Date.now();
    try {
      await addDoc(collection(db, "conversations", convId, "messages"), {
        convId, senderUid: user.uid, text: content, createdAt: now, read: false,
      });
      const otherUid = conv?.participants.find((p) => p !== user.uid);
      await updateDoc(doc(db, "conversations", convId), {
        lastMessage: content, lastMessageAt: now,
        ...(otherUid ? { [`unreadCount.${otherUid}`]: (conv?.unreadCount?.[otherUid] ?? 0) + 1 } : {}),
      });
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: msg }) => {
            const mine = msg.senderUid === user?.uid;
            return (
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                <Text style={[styles.msgText, mine && styles.msgTextMine]}>{msg.text}</Text>
                <Text style={[styles.msgTime, mine && styles.msgTimeMine]}>
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Say hello to {otherProfile?.displayName ?? "your match"}! 👋
              </Text>
            </View>
          }
        />

        {/* Input bar */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message…"
            placeholderTextColor={colors.gray400}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!text.trim() || sending}
          >
            {sending
              ? <ActivityIndicator size="small" color={colors.white} />
              : <Send size={18} color={colors.white} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: colors.gray50 },
  list:           { paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.sm, paddingBottom: 20 },
  bubble:         { maxWidth: "75%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMine:     { alignSelf: "flex-end", backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleOther:    { alignSelf: "flex-start", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray100, borderBottomLeftRadius: 4 },
  msgText:        { fontSize: 14, color: colors.gray900, lineHeight: 20 },
  msgTextMine:    { color: colors.white },
  msgTime:        { fontSize: 10, color: colors.gray400, marginTop: 3 },
  msgTimeMine:    { color: "rgba(255,255,255,0.6)" },
  empty:          { paddingVertical: 60, alignItems: "center" },
  emptyText:      { ...typography.body, color: colors.gray400, textAlign: "center" },
  inputRow:       { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray100 },
  input:          { flex: 1, borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.gray900, maxHeight: 100, backgroundColor: colors.gray50 },
  sendBtn:        { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  sendBtnDisabled:{ opacity: 0.4 },
});
