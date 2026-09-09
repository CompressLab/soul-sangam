import { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ViewStyle,
} from "react-native";
import { router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { UserProfile } from "@shared/types";
import { Heart, MapPin } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { colors, radius, spacing } from "@/constants/theme";

interface Props {
  profile: UserProfile;
  style?:  ViewStyle;
}

export function ProfileCard({ profile, style }: Props) {
  const { user }         = useAuth();
  const [liked, setLiked] = useState(false);
  const photo = profile.photos?.[0] ?? profile.photoURL;

  async function sendInterest() {
    if (!user || liked) return;
    setLiked(true);
    try {
      await addDoc(collection(db, "interests"), {
        fromUid: user.uid, toUid: profile.uid,
        status: "pending", createdAt: Date.now(), updatedAt: Date.now(),
      });
      Toast.show({ type: "success", text1: `Interest sent to ${profile.displayName}!` });
    } catch {
      setLiked(false);
      Toast.show({ type: "error", text1: "Failed to send interest." });
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={[styles.card, style]}
      onPress={() => router.push(`/profile/${profile.uid}`)}
    >
      {/* Photo */}
      <View style={styles.photoWrap}>
        {photo
          ? <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
          : <Text style={{ fontSize: 40, textAlign: "center" }}>👤</Text>}

        {/* Like button */}
        {user && user.uid !== profile.uid && (
          <TouchableOpacity
            onPress={sendInterest}
            style={[styles.likeBtn, liked && styles.likeBtnActive]}
          >
            <Heart size={14} color={liked ? colors.white : colors.gray500} fill={liked ? colors.white : "none"} />
          </TouchableOpacity>
        )}

        {profile.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        )}

        {/* Gradient name overlay */}
        <View style={styles.overlay}>
          <Text style={styles.name} numberOfLines={1}>{profile.displayName}</Text>
          <Text style={styles.age}>{profile.age} yrs</Text>
        </View>
      </View>

      {/* Info strip */}
      <View style={styles.info}>
        <View style={styles.locationRow}>
          <MapPin size={11} color={colors.primary} />
          <Text style={styles.location} numberOfLines={1}>
            {profile.location.city}, {profile.location.country}
          </Text>
        </View>
        <View style={styles.tagRow}>
          {[
            profile.religion.charAt(0).toUpperCase() + profile.religion.slice(1),
            profile.occupation,
          ].map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:          { backgroundColor: colors.white, borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.gray100 },
  photoWrap:     { aspectRatio: 3 / 4, backgroundColor: colors.gray100, alignItems: "center", justifyContent: "center", position: "relative" },
  photo:         { width: "100%", height: "100%" },
  likeBtn:       { position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.85)", alignItems: "center", justifyContent: "center" },
  likeBtnActive: { backgroundColor: colors.primary },
  verifiedBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "#16a34a", borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  verifiedText:  { color: colors.white, fontSize: 9, fontWeight: "700" },
  overlay:       { position: "absolute", bottom: 0, left: 0, right: 0, padding: spacing.sm, paddingBottom: 10, backgroundColor: "rgba(0,0,0,0.45)" },
  name:          { color: colors.white, fontSize: 13, fontWeight: "700" },
  age:           { color: "rgba(255,255,255,0.8)", fontSize: 11 },
  info:          { padding: spacing.sm, gap: 4 },
  locationRow:   { flexDirection: "row", alignItems: "center", gap: 3 },
  location:      { fontSize: 11, color: colors.gray500, flex: 1 },
  tagRow:        { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tag:           { backgroundColor: colors.primary50, borderRadius: radius.full, paddingHorizontal: 7, paddingVertical: 2 },
  tagText:       { fontSize: 9, fontWeight: "600", color: colors.primary },
});
