"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@shared/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { calcAge } from "@shared/utils/age";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PhotoUploader } from "@/components/profile/PhotoUploader";
import { Save, ArrowLeft } from "lucide-react";
import type { UserProfile } from "@shared/types";

const schema = z.object({
  displayName:   z.string().min(2),
  bio:           z.string().min(20).max(500),
  occupation:    z.string().min(1),
  annualIncome:  z.string().optional(),
  hobbies:       z.string().optional(),
  city:          z.string().min(1),
  state:         z.string().min(1),
  country:       z.string().min(1),
  profileVisible: z.boolean(),
  photosBlurred:  z.boolean(),
  // Preferences
  prefAgeMin: z.coerce.number().min(18).max(80),
  prefAgeMax: z.coerce.number().min(18).max(80),
});

type FormData = z.infer<typeof schema>;

export default function EditProfilePage() {
  useRequireAuth();
  const { user }                    = useAuth();
  const router                      = useRouter();
  const [photos,  setPhotos]        = useState<string[]>([]);
  const [saving,  setSaving]        = useState(false);
  const [loading, setLoading]       = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (!snap.exists()) return;
      const p = snap.data() as UserProfile;
      setPhotos(p.photos ?? []);
      reset({
        displayName:    p.displayName,
        bio:            p.bio,
        occupation:     p.occupation,
        annualIncome:   p.annualIncome ?? "",
        hobbies:        p.hobbies?.join(", ") ?? "",
        city:           p.location.city,
        state:          p.location.state,
        country:        p.location.country,
        profileVisible: p.profileVisible,
        photosBlurred:  p.photosBlurred,
        prefAgeMin:     p.preferences?.ageMin ?? 22,
        prefAgeMax:     p.preferences?.ageMax ?? 40,
      });
      setLoading(false);
    });
  }, [user, reset]);

  async function onSubmit(data: FormData) {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName:    data.displayName,
        bio:            data.bio,
        occupation:     data.occupation,
        annualIncome:   data.annualIncome ?? "",
        hobbies:        data.hobbies ? data.hobbies.split(",").map((h) => h.trim()) : [],
        photos,
        photoURL:       photos[0] ?? user.photoURL ?? null,
        location: {
          city:    data.city,
          state:   data.state,
          country: data.country,
        },
        profileVisible: data.profileVisible,
        photosBlurred:  data.photosBlurred,
        preferences: {
          ageMin: data.prefAgeMin,
          ageMax: data.prefAgeMax,
        },
        updatedAt: Date.now(),
      });
      toast.success("Profile updated!");
      router.push(`/profile/view?uid=${user.uid}`);
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto animate-pulse space-y-4 mt-8">
      {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-gray-200" />)}
    </div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="btn-ghost mb-4">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Photos */}
        <section className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Profile Photos</h2>
          {user && (
            <PhotoUploader uid={user.uid} photos={photos} onChange={setPhotos} />
          )}
        </section>

        {/* Basic info */}
        <section className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Basic Information</h2>
          <Field label="Display Name" error={errors.displayName?.message}>
            <input className="input" {...register("displayName")} />
          </Field>
          <Field label="About Me" error={errors.bio?.message}>
            <textarea className="input min-h-[120px] resize-none" {...register("bio")} />
          </Field>
          <Field label="Hobbies (comma separated)">
            <input className="input" placeholder="e.g. reading, cooking" {...register("hobbies")} />
          </Field>
        </section>

        {/* Career */}
        <section className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Career</h2>
          <Field label="Occupation" error={errors.occupation?.message}>
            <input className="input" {...register("occupation")} />
          </Field>
          <Field label="Annual Income (optional)">
            <select className="input" {...register("annualIncome")}>
              <option value="">Prefer not to say</option>
              {["Under £20k","£20k–£35k","£35k–£50k","£50k–£75k","£75k–£100k","£100k+"].map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </Field>
        </section>

        {/* Location */}
        <section className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Location</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City" error={errors.city?.message}>
              <input className="input" {...register("city")} />
            </Field>
            <Field label="State / County" error={errors.state?.message}>
              <input className="input" {...register("state")} />
            </Field>
          </div>
          <Field label="Country" error={errors.country?.message}>
            <input className="input" {...register("country")} />
          </Field>
        </section>

        {/* Preferences */}
        <section className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Match Preferences</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Partner Age Min" error={errors.prefAgeMin?.message}>
              <input type="number" className="input" {...register("prefAgeMin")} />
            </Field>
            <Field label="Partner Age Max" error={errors.prefAgeMax?.message}>
              <input type="number" className="input" {...register("prefAgeMax")} />
            </Field>
          </div>
        </section>

        {/* Privacy */}
        <section className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Privacy</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-primary-600" {...register("profileVisible")} />
            <span className="text-sm text-gray-700">Show my profile in search results</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-primary-600" {...register("photosBlurred")} />
            <span className="text-sm text-gray-700">Blur photos until interest is accepted</span>
          </label>
        </section>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          <Save size={16} />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label block mb-1">{label}</label>
      {children}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
