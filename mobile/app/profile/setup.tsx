import { useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { calcAge } from "@shared/utils/age";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PhotoUploader } from "@/components/profile/PhotoUploader";
import { ChevronLeft, ChevronRight, Check } from "lucide-react-native";
import { colors, spacing, radius, typography } from "@/constants/theme";

const STEPS = ["Personal", "Location", "About Me", "Preferences", "Photos"];

type FormState = {
  displayName:   string;
  gender:        string;
  dateOfBirth:   string;
  height:        string;
  maritalStatus: string;
  religion:      string;
  caste:         string;
  motherTongue:  string;
  nationality:   string;
  city:          string;
  state:         string;
  country:       string;
  education:     string;
  occupation:    string;
  bio:           string;
  hobbies:       string;
  prefAgeMin:    string;
  prefAgeMax:    string;
};

const INIT: FormState = {
  displayName: "", gender: "", dateOfBirth: "",
  height: "", maritalStatus: "", religion: "", caste: "", motherTongue: "",
  nationality: "British", city: "", state: "", country: "United Kingdom",
  education: "", occupation: "", bio: "", hobbies: "",
  prefAgeMin: "22", prefAgeMax: "35",
};

function SelectRow({ label, options, value, onChange }: {
  label: string; options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={typography.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.chip, value === opt.value && styles.chipActive]}
          >
            <Text style={[styles.chipText, value === opt.value && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default function ProfileSetupScreen() {
  const { user }                      = useAuth();
  const [step,    setStep]            = useState(0);
  const [form,    setForm]            = useState<FormState>(INIT);
  const [photos,  setPhotos]          = useState<string[]>([]);
  const [saving,  setSaving]          = useState(false);
  const [errors,  setErrors]          = useState<Partial<FormState>>({});

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (step === 0) {
      if (!form.displayName.trim()) e.displayName = "Required";
      if (!form.gender)             e.gender      = "Required";
      if (!form.dateOfBirth)        e.dateOfBirth = "Required (YYYY-MM-DD)";
      if (!form.height)             e.height      = "Required";
      if (!form.maritalStatus)      e.maritalStatus = "Required";
      if (!form.religion)           e.religion    = "Required";
    }
    if (step === 1) {
      if (!form.city.trim())    e.city    = "Required";
      if (!form.country.trim()) e.country = "Required";
      if (!form.education)      e.education = "Required";
      if (!form.occupation.trim()) e.occupation = "Required";
    }
    if (step === 2) {
      if (form.bio.trim().length < 20) e.bio = "At least 20 characters";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validate()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function submit() {
    if (!user) return;
    setSaving(true);
    try {
      const age = calcAge(form.dateOfBirth);
      await setDoc(doc(db, "users", user.uid), {
        uid:           user.uid,
        displayName:   form.displayName,
        email:         user.email ?? "",
        photoURL:      photos[0] ?? user.photoURL ?? null,
        photos,
        createdAt:     Date.now(),
        updatedAt:     Date.now(),
        gender:        form.gender,
        dateOfBirth:   form.dateOfBirth,
        age,
        height:        Number(form.height),
        maritalStatus: form.maritalStatus,
        religion:      form.religion,
        caste:         form.caste,
        motherTongue:  form.motherTongue,
        nationality:   form.nationality,
        location:      { city: form.city, state: form.state, country: form.country },
        education:     form.education,
        occupation:    form.occupation,
        bio:           form.bio,
        hobbies:       form.hobbies.split(",").map((h) => h.trim()).filter(Boolean),
        preferences: {
          ageMin:        Number(form.prefAgeMin),
          ageMax:        Number(form.prefAgeMax),
          religions:     [form.religion],
          maritalStatus: ["never_married"],
          locations:     ["Any"],
        },
        profileVisible:  true,
        photosBlurred:   false,
        profileComplete: true,
        verified:        false,
      });
      Toast.show({ type: "success", text1: "Profile created! 🎉" });
      router.replace("/(tabs)/browse");
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed to save profile. Try again." });
    } finally {
      setSaving(false);
    }
  }

  const genderOpts      = [{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }];
  const maritalOpts     = [{ value: "never_married", label: "Never Married" }, { value: "divorced", label: "Divorced" }, { value: "widowed", label: "Widowed" }, { value: "separated", label: "Separated" }];
  const religionOpts    = ["hindu","muslim","christian","sikh","jain","buddhist","jewish","other"].map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }));
  const educationOpts   = ["High School","A-Levels","Bachelor's","Master's","PhD","Other"].map((e) => ({ value: e, label: e }));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Progress bar */}
      <View style={styles.progressRow}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.progressDot, i <= step && styles.progressDotActive]}
          />
        ))}
      </View>
      <Text style={styles.stepLabel}>{STEPS[step]}</Text>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Step 0 — Personal */}
          {step === 0 && (
            <View style={styles.fields}>
              <Input label="Full Name" value={form.displayName} onChangeText={(v) => set("displayName", v)} error={errors.displayName} />
              <SelectRow label="Gender" options={genderOpts} value={form.gender} onChange={(v) => set("gender", v)} />
              {errors.gender && <Text style={styles.errText}>{errors.gender}</Text>}
              <Input label="Date of Birth (YYYY-MM-DD)" value={form.dateOfBirth} onChangeText={(v) => set("dateOfBirth", v)} placeholder="e.g. 1992-06-15" error={errors.dateOfBirth} keyboardType="numeric" />
              <Input label="Height (cm)" value={form.height} onChangeText={(v) => set("height", v)} keyboardType="numeric" placeholder="e.g. 170" error={errors.height} />
              <SelectRow label="Marital Status" options={maritalOpts} value={form.maritalStatus} onChange={(v) => set("maritalStatus", v)} />
              {errors.maritalStatus && <Text style={styles.errText}>{errors.maritalStatus}</Text>}
              <SelectRow label="Religion" options={religionOpts} value={form.religion} onChange={(v) => set("religion", v)} />
              {errors.religion && <Text style={styles.errText}>{errors.religion}</Text>}
              <Input label="Caste (optional)" value={form.caste} onChangeText={(v) => set("caste", v)} placeholder="e.g. Sunni" />
              <Input label="Mother Tongue (optional)" value={form.motherTongue} onChangeText={(v) => set("motherTongue", v)} placeholder="e.g. Urdu" />
            </View>
          )}

          {/* Step 1 — Location */}
          {step === 1 && (
            <View style={styles.fields}>
              <Input label="Nationality" value={form.nationality} onChangeText={(v) => set("nationality", v)} />
              <Input label="City" value={form.city} onChangeText={(v) => set("city", v)} error={errors.city} />
              <Input label="State / County" value={form.state} onChangeText={(v) => set("state", v)} />
              <Input label="Country" value={form.country} onChangeText={(v) => set("country", v)} error={errors.country} />
              <SelectRow label="Education" options={educationOpts} value={form.education} onChange={(v) => set("education", v)} />
              {errors.education && <Text style={styles.errText}>{errors.education}</Text>}
              <Input label="Occupation" value={form.occupation} onChangeText={(v) => set("occupation", v)} error={errors.occupation} placeholder="e.g. Software Engineer" />
            </View>
          )}

          {/* Step 2 — About Me */}
          {step === 2 && (
            <View style={styles.fields}>
              <Input label="About Me" value={form.bio} onChangeText={(v) => set("bio", v)} error={errors.bio} multiline numberOfLines={5} placeholder="Tell potential matches about yourself, your values, and what you're looking for…" style={{ minHeight: 120, textAlignVertical: "top" }} />
              <Input label="Hobbies (comma separated, optional)" value={form.hobbies} onChangeText={(v) => set("hobbies", v)} placeholder="e.g. reading, cooking, hiking" />
            </View>
          )}

          {/* Step 3 — Preferences */}
          {step === 3 && (
            <View style={styles.fields}>
              <Text style={[typography.body, { color: colors.gray500 }]}>
                Set your basic match preferences. You can update these later.
              </Text>
              <Input label="Partner Min Age" value={form.prefAgeMin} onChangeText={(v) => set("prefAgeMin", v)} keyboardType="numeric" />
              <Input label="Partner Max Age" value={form.prefAgeMax} onChangeText={(v) => set("prefAgeMax", v)} keyboardType="numeric" />
            </View>
          )}

          {/* Step 4 — Photos */}
          {step === 4 && user && (
            <View style={styles.fields}>
              <Text style={[typography.body, { color: colors.gray500 }]}>
                Add up to 6 photos. Your first photo will be your main profile picture.
              </Text>
              <PhotoUploader uid={user.uid} photos={photos} onChange={setPhotos} />
              {photos.length === 0 && (
                <View style={styles.noPhotoHint}>
                  <Text style={styles.noPhotoText}>
                    At least one photo is recommended to get more profile views.
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={() => setStep((s) => Math.max(s - 1, 0))}
          disabled={step === 0}
          style={[styles.navBtn, step === 0 && { opacity: 0 }]}
        >
          <ChevronLeft size={20} color={colors.primary} />
          <Text style={styles.navBtnText}>Back</Text>
        </TouchableOpacity>

        {step < STEPS.length - 1 ? (
          <TouchableOpacity onPress={next} style={[styles.navBtn, styles.navBtnPrimary]}>
            <Text style={[styles.navBtnText, { color: colors.white }]}>Next</Text>
            <ChevronRight size={20} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={submit} disabled={saving} style={[styles.navBtn, styles.navBtnPrimary]}>
            {saving
              ? <ActivityIndicator color={colors.white} size="small" />
              : <><Text style={[styles.navBtnText, { color: colors.white }]}>Complete</Text><Check size={18} color={colors.white} /></>
            }
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: colors.white },
  progressRow:    { flexDirection: "row", justifyContent: "center", gap: 8, paddingTop: spacing.md, paddingHorizontal: spacing.md },
  progressDot:    { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.gray200 },
  progressDotActive: { backgroundColor: colors.primary },
  stepLabel:      { ...typography.label, textAlign: "center", marginTop: 8, marginBottom: 4, color: colors.primary },
  scroll:         { paddingHorizontal: spacing.md, paddingBottom: 120 },
  fields:         { gap: spacing.md, paddingTop: spacing.md },
  chip:           { borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 7 },
  chipActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText:       { fontSize: 13, color: colors.gray600 },
  chipTextActive: { color: colors.white, fontWeight: "600" },
  errText:        { fontSize: 11, color: colors.red, marginTop: -8 },
  noPhotoHint:    { backgroundColor: "#fefce8", borderRadius: radius.md, padding: spacing.sm },
  noPhotoText:    { fontSize: 12, color: "#92400e" },
  navRow:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray100, backgroundColor: colors.white },
  navBtn:         { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 11, paddingHorizontal: 20, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.primary },
  navBtnPrimary:  { backgroundColor: colors.primary, borderColor: colors.primary },
  navBtnText:     { fontSize: 14, fontWeight: "700", color: colors.primary },
});
