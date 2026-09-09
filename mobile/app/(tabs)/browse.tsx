import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  TextInput, TouchableOpacity, ActivityIndicator,
  FlatList,
} from "react-native";
import {
  collection, query, where, orderBy,
  limit, getDocs, startAfter, DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { UserProfile } from "@shared/types";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { colors, spacing, radius, typography } from "@/constants/theme";
import { SlidersHorizontal, Search } from "lucide-react-native";

const PAGE_SIZE = 12;

interface Filters {
  gender:   string;
  religion: string;
  ageMin:   number;
  ageMax:   number;
}

const DEFAULT: Filters = { gender: "", religion: "", ageMin: 18, ageMax: 60 };

export default function BrowseScreen() {
  const { user }                           = useAuth();
  const [profiles,    setProfiles]         = useState<UserProfile[]>([]);
  const [loading,     setLoading]          = useState(true);
  const [lastDoc,     setLastDoc]          = useState<DocumentSnapshot | null>(null);
  const [hasMore,     setHasMore]          = useState(true);
  const [searchCity,  setSearchCity]       = useState("");
  const [showFilters, setShowFilters]      = useState(false);
  const [filters,     setFilters]          = useState<Filters>(DEFAULT);

  useEffect(() => { fetchProfiles(true); }, [filters]);

  async function fetchProfiles(reset = false) {
    if (!user) return;
    setLoading(true);
    try {
      const constraints: Parameters<typeof query>[1][] = [
        where("profileVisible",  "==", true),
        where("profileComplete", "==", true),
        where("uid",             "!=", user.uid),
      ];
      if (filters.gender)   constraints.push(where("gender",   "==", filters.gender));
      if (filters.religion) constraints.push(where("religion", "==", filters.religion));
      constraints.push(where("age", ">=", filters.ageMin));
      constraints.push(where("age", "<=", filters.ageMax));
      constraints.push(orderBy("uid"));
      constraints.push(limit(PAGE_SIZE));
      if (!reset && lastDoc) constraints.push(startAfter(lastDoc));

      const q    = query(collection(db, "users"), ...constraints);
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => d.data() as UserProfile);

      setProfiles((prev) => reset ? docs : [...prev, ...docs]);
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const displayed = searchCity
    ? profiles.filter((p) => p.location.city.toLowerCase().includes(searchCity.toLowerCase()))
    : profiles;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Browse Profiles</Text>
          <Text style={styles.count}>{displayed.length} profiles</Text>
        </View>
        <TouchableOpacity onPress={() => setShowFilters((f) => !f)} style={styles.filterBtn}>
          <SlidersHorizontal size={18} color={showFilters ? colors.primary : colors.gray500} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Search size={15} color={colors.gray400} style={{ position: "absolute", left: 14, zIndex: 1 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by city…"
          placeholderTextColor={colors.gray400}
          value={searchCity}
          onChangeText={setSearchCity}
        />
      </View>

      {/* Filters panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterLabel}>Gender</Text>
          <View style={styles.chips}>
            {["", "male", "female"].map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setFilters((f) => ({ ...f, gender: g }))}
                style={[styles.chip, filters.gender === g && styles.chipActive]}
              >
                <Text style={[styles.chipText, filters.gender === g && styles.chipTextActive]}>
                  {g === "" ? "Any" : g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterLabel}>Religion</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={["", "muslim", "hindu", "christian", "sikh", "other"]}
            keyExtractor={(i) => i}
            renderItem={({ item: r }) => (
              <TouchableOpacity
                onPress={() => setFilters((f) => ({ ...f, religion: r }))}
                style={[styles.chip, filters.religion === r && styles.chipActive]}
              >
                <Text style={[styles.chipText, filters.religion === r && styles.chipTextActive]}>
                  {r === "" ? "Any" : r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ gap: 6 }}
          />

          <TouchableOpacity onPress={() => setFilters(DEFAULT)} style={styles.resetBtn}>
            <Text style={styles.resetText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Profile grid */}
      {loading && profiles.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(p) => p.uid}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => <ProfileCard profile={item} style={{ flex: 1 }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No profiles found. Try adjusting filters.</Text>
            </View>
          }
          onEndReached={() => { if (hasMore && !loading) fetchProfiles(false); }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loading && profiles.length > 0
              ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
              : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: colors.gray50 },
  header:       { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title:        { ...typography.h2 },
  count:        { ...typography.small, marginTop: 2 },
  filterBtn:    { padding: 8, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200 },
  searchRow:    { marginHorizontal: spacing.md, marginBottom: spacing.sm, position: "relative", justifyContent: "center" },
  searchInput:  { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.full, paddingHorizontal: 36, paddingVertical: 10, fontSize: 14, color: colors.gray900 },
  filtersPanel: { backgroundColor: colors.white, marginHorizontal: spacing.md, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm, borderWidth: 1, borderColor: colors.gray100 },
  filterLabel:  { ...typography.label, marginBottom: 4 },
  chips:        { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  chip:         { borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5 },
  chipActive:   { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText:     { fontSize: 12, color: colors.gray600 },
  chipTextActive: { color: colors.white, fontWeight: "600" },
  resetBtn:     { alignSelf: "flex-end" },
  resetText:    { fontSize: 12, color: colors.red, fontWeight: "500" },
  grid:         { paddingHorizontal: spacing.md, paddingBottom: 80, gap: spacing.sm },
  empty:        { paddingVertical: 60, alignItems: "center" },
  emptyText:    { ...typography.body, color: colors.gray400, textAlign: "center" },
});
