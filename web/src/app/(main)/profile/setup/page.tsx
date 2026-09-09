"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@shared/firebase/config";
import { uploadToCloudinary } from "@shared/utils/cloudinary";
import { useAuth } from "@/context/AuthContext";
import { calcAge } from "@shared/utils/age";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Camera, ChevronRight, ChevronLeft, Check } from "lucide-react";
import Image from "next/image";
import type { Religion, MaritalStatus, Gender } from "@shared/types";

// ── Validation schema ──────────────────────────────────────────────────────

const setupSchema = z.object({
  displayName:   z.string().min(2, "Name must be at least 2 characters"),
  gender:        z.enum(["male", "female", "other"]),
  dateOfBirth:   z.string().min(1, "Date of birth is required"),
  height:        z.coerce.number().min(100).max(250),
  maritalStatus: z.enum(["never_married", "divorced", "widowed", "separated"]),
  religion:      z.enum(["hindu", "muslim", "christian", "sikh", "jain", "buddhist", "jewish", "other"]),
  caste:         z.string().optional(),
  motherTongue:  z.string().optional(),
  nationality:   z.string().min(1, "Nationality is required"),
  city:          z.string().min(1, "City is required"),
  state:         z.string().min(1, "State/County is required"),
  country:       z.string().min(1, "Country is required"),
  education:     z.string().min(1, "Education is required"),
  occupation:    z.string().min(1, "Occupation is required"),
  annualIncome:  z.string().optional(),
  bio:           z.string().min(20, "Bio must be at least 20 characters").max(500),
  hobbies:       z.string().optional(),
  // Preferences
  prefAgeMin:    z.coerce.number().min(18).max(80),
  prefAgeMax:    z.coerce.number().min(18).max(80),
});

type SetupFormData = z.infer<typeof setupSchema>;

const STEPS = ["Personal", "Location & Career", "About Me", "Preferences", "Photos"];

// ── Component ──────────────────────────────────────────────────────────────

export default function ProfileSetupPage() {
  const { user } = useAuth();
  const router   = useRouter();
  const [step, setStep]       = useState(0);
  const [photos, setPhotos]   = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving]   = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: { prefAgeMin: 22, prefAgeMax: 35, nationality: "British", country: "United Kingdom" },
  });

  // Step field groups for per-step validation
  const stepFields: (keyof SetupFormData)[][] = [
    ["displayName", "gender", "dateOfBirth", "height", "maritalStatus", "religion"],
    ["nationality", "city", "state", "country", "education", "occupation"],
    ["bio"],
    ["prefAgeMin", "prefAgeMax"],
    [],
  ];

  async function nextStep() {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6 - photos.length);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPhotos((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removePhoto(idx: number) {
    setPhotos((prev)    => prev.filter((_, i) => i !== idx));
    setPreviews((prev)  => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(data: SetupFormData) {
    if (!user) return;
    setSaving(true);
    try {
      // Upload photos to Cloudinary
      const photoURLs: string[] = [];
      for (const file of photos) {
        const result = await uploadToCloudinary(file, "profiles");
        photoURLs.push(result.secure_url);
      }

      const age = calcAge(data.dateOfBirth);

      await setDoc(doc(db, "users", user.uid), {
        uid:           user.uid,
        displayName:   data.displayName,
        email:         user.email ?? "",
        photoURL:      photoURLs[0] ?? user.photoURL ?? null,
        photos:        photoURLs,
        createdAt:     Date.now(),
        updatedAt:     Date.now(),
        gender:        data.gender as Gender,
        dateOfBirth:   data.dateOfBirth,
        age,
        height:        data.height,
        maritalStatus: data.maritalStatus as MaritalStatus,
        religion:      data.religion as Religion,
        caste:         data.caste ?? "",
        motherTongue:  data.motherTongue ?? "",
        nationality:   data.nationality,
        location:      { city: data.city, state: data.state, country: data.country },
        education:     data.education,
        occupation:    data.occupation,
        annualIncome:  data.annualIncome ?? "",
        bio:           data.bio,
        hobbies:       data.hobbies ? data.hobbies.split(",").map((h) => h.trim()) : [],
        preferences: {
          ageMin:        data.prefAgeMin,
          ageMax:        data.prefAgeMax,
          religions:     [data.religion],
          maritalStatus: ["never_married"],
          locations:     ["Any"],
        },
        profileVisible:  true,
        photosBlurred:   false,
        profileComplete: true,
        verified:        false,
      });

      toast.success("Profile created! Welcome to Nikkah Connect 🎉");
      router.push("/browse");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition
                  ${i < step  ? "bg-primary-600 text-white"
                  : i === step ? "bg-primary-600 text-white ring-4 ring-primary-100"
                  : "bg-gray-200 text-gray-500"}`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 md:w-16 ${i < step ? "bg-primary-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm font-medium text-gray-700">{STEPS[step]}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card p-6 space-y-5">

          {/* ── Step 0: Personal ─────────────────────────────────────── */}
          {step === 0 && (
            <>
              <Field label="Full Name" error={errors.displayName?.message}>
                <input className="input" placeholder="Your full name" {...register("displayName")} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Gender" error={errors.gender?.message}>
                  <select className="input" {...register("gender")}>
                    <option value="">Select…</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Date of Birth" error={errors.dateOfBirth?.message}>
                  <input type="date" className="input" {...register("dateOfBirth")} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Height (cm)" error={errors.height?.message}>
                  <input type="number" className="input" placeholder="e.g. 170" {...register("height")} />
                </Field>
                <Field label="Marital Status" error={errors.maritalStatus?.message}>
                  <select className="input" {...register("maritalStatus")}>
                    <option value="">Select…</option>
                    <option value="never_married">Never Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="separated">Separated</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Religion" error={errors.religion?.message}>
                  <select className="input" {...register("religion")}>
                    <option value="">Select…</option>
                    {["hindu","muslim","christian","sikh","jain","buddhist","jewish","other"].map((r) => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Caste (optional)" error={errors.caste?.message}>
                  <input className="input" placeholder="e.g. Sunni" {...register("caste")} />
                </Field>
              </div>
              <Field label="Mother Tongue (optional)">
                <input className="input" placeholder="e.g. Urdu" {...register("motherTongue")} />
              </Field>
            </>
          )}

          {/* ── Step 1: Location & Career ────────────────────────────── */}
          {step === 1 && (
            <>
              <Field label="Nationality" error={errors.nationality?.message}>
                <input className="input" placeholder="e.g. British" {...register("nationality")} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" error={errors.city?.message}>
                  <input className="input" placeholder="e.g. London" {...register("city")} />
                </Field>
                <Field label="State / County" error={errors.state?.message}>
                  <input className="input" placeholder="e.g. Greater London" {...register("state")} />
                </Field>
              </div>
              <Field label="Country" error={errors.country?.message}>
                <input className="input" placeholder="e.g. United Kingdom" {...register("country")} />
              </Field>
              <Field label="Education" error={errors.education?.message}>
                <select className="input" {...register("education")}>
                  <option value="">Select…</option>
                  {["High School","A-Levels","Bachelor's","Master's","PhD","Other"].map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </Field>
              <Field label="Occupation" error={errors.occupation?.message}>
                <input className="input" placeholder="e.g. Software Engineer" {...register("occupation")} />
              </Field>
              <Field label="Annual Income (optional)">
                <select className="input" {...register("annualIncome")}>
                  <option value="">Prefer not to say</option>
                  {["Under £20k","£20k–£35k","£35k–£50k","£50k–£75k","£75k–£100k","£100k+"].map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </Field>
            </>
          )}

          {/* ── Step 2: About Me ─────────────────────────────────────── */}
          {step === 2 && (
            <>
              <Field label="About Me" error={errors.bio?.message}>
                <textarea
                  className="input min-h-[140px] resize-none"
                  placeholder="Tell potential matches about yourself, your values, what you're looking for…"
                  {...register("bio")}
                />
                <p className="text-xs text-gray-400 mt-1">Minimum 20 characters, max 500</p>
              </Field>
              <Field label="Hobbies & Interests (optional)">
                <input
                  className="input"
                  placeholder="e.g. reading, cooking, hiking (comma separated)"
                  {...register("hobbies")}
                />
              </Field>
            </>
          )}

          {/* ── Step 3: Preferences ──────────────────────────────────── */}
          {step === 3 && (
            <>
              <p className="text-sm text-gray-500">
                Set basic preferences to help us suggest compatible matches.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Partner Age Min" error={errors.prefAgeMin?.message}>
                  <input type="number" className="input" min={18} max={80} {...register("prefAgeMin")} />
                </Field>
                <Field label="Partner Age Max" error={errors.prefAgeMax?.message}>
                  <input type="number" className="input" min={18} max={80} {...register("prefAgeMax")} />
                </Field>
              </div>
              <p className="text-xs text-gray-400">
                You can update detailed preferences later from your profile settings.
              </p>
            </>
          )}

          {/* ── Step 4: Photos ───────────────────────────────────────── */}
          {step === 4 && (
            <>
              <p className="text-sm text-gray-500">
                Add up to 6 photos. Your first photo will be your main profile picture.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <Image src={src} alt={`Photo ${i + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                    >
                      ×
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
                {previews.length < 6 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition">
                    <Camera size={24} className="text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">Add photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}
              </div>
              {previews.length === 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  At least one photo is recommended to get more profile views.
                </p>
              )}
            </>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
            className="btn-outline disabled:opacity-0"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={nextStep} className="btn-primary">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Complete Profile"}
              {!saving && <Check size={16} />}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label block mb-1">{label}</label>
      {children}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
