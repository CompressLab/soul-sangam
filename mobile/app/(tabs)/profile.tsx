import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  Image, ScrollView, TouchableOpacity, ActivityIndicator,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { UserProfile } from "@shared/types";
import { router } from "expo-router";
import { formatHeight } from "@shared/utils/age";
import { MapPin, Briefcase, BookOpen, Edit2, LogOut, Check } from "lucide-react-native";
import { colors, spacing, radius, typography } from "@/constants/theme";

export default function MyProfileScreen() {
  const { user, logout }              = useAuth();
  const [profile, setProfile]         = useState<UserProfile | null>(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) setProfile(snap.data() as UserProfile);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} size="large" />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={typography.body}>Profile not found.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.push("/profile/setup")}>
            <Text style={styles.btnText}>Create Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const photo = profile.photos?.[0] ?? profile.photoURL;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.photoWrap}>
            {photo
              ? <Image source={{ uri: photo }} style={styles.photo} />
              : <Text style={{ fontSize: 60 }}>👤</Text>}
          </View>
          <Text style={styles.name}>{profile.displayName}</Text>
          <Text style={styles.subName}>
            {profile.age} yrs · {profile.maritalStatus.replace("_", " ")} · {formatHeight(profile.height)}
          </Text>
          {profile.verified && (
            <View style={styles.verifiedBadge}>
              <Check size={12} color={colors.white} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}

          {/* Religion tags */}
          <View style={styles.tags}>
            {[
              profile.religion.charAt(0).toUpperCase() + profile.religion.slice(1),
              profile.caste,
              profile.nationality,
            ].filter(Boolean).map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick facts */}
        <View style={styles.card}>
          <InfoRow icon={MapPin}   label="Location"   value={`${profile.location.city}, ${profile.location.country}`} />
          <InfoRow icon={Briefcase} label="Occupation" value={profile.occupation} />
          <InfoRow icon={BookOpen}  label="Education"  value={profile.education} />
        </View>

        {/* Bio */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About Me</Text>
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

        {/* Actions */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.primary }]}
          onPress={() => router.push("/profile/setup")}
        >
          <Edit2 size={15} color={colors.primary} />
          <Text style={[styles.btnText, { color: colors.primary }]}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.gray100 }]} onPress={logout}>
          <LogOut size={15} color={colors.gray500} />
          <Text style={[styles.btnText, { color: colors.gray500 }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Icon size={14} color={colors.primary} />
      <View>
        <Text style={{ fontSize: 10, color: colors.gray400, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.gray900 }}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: colors.gray50 },
  scroll:       { paddingBottom: 100, gap: spacing.md },
  center:       { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  hero:         { alignItems: "center", paddingTop: spacing.xl, paddingHorizontal: spacing.md, gap: spacing.sm },
  photoWrap:    { width: 110, height: 110, borderRadius: 55, backgroundColor: colors.gray100, alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: 3, borderColor: colors.primary },
  photo:        { width: 110, height: 110 },
  name:         { fontSize: 24, fontWeight: "800", color: colors.gray900 },
  subName:      { fontSize: 13, color: colors.gray500 },
  verifiedBadge:{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.green, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  verifiedText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  tags:         { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  tag:          { backgroundColor: colors.primary50, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  tagText:      { fontSize: 11, fontWeight: "600", color: colors.primary },
  card:         { backgroundColor: colors.white, marginHorizontal: spacing.md, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, borderWidth: 1, borderColor: colors.gray100 },
  infoRow:      { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.gray700, marginBottom: 4 },
  bio:          { fontSize: 13, color: colors.gray600, lineHeight: 21 },
  btn:          { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: spacing.md, paddingVertical: 13, borderRadius: radius.full, backgroundColor: colors.primary },
  btnText:      { color: colors.white, fontWeight: "700", fontSize: 14 },
});
