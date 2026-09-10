"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@shared/utils/cloudinary";
import { compressImages } from "@/lib/imageCompress";
import { GEO_DATA, CURRENCIES } from "@/lib/geoData";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { calcAge } from "@shared/utils/age";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Camera, ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import type { Religion, MaritalStatus, Gender } from "@shared/types";
import { FloatingSymbols } from "@/components/ui/FloatingSymbols";

// ── Schema ─────────────────────────────────────────────────────────────────

const setupSchema = z.object({
  displayName:    z.string().min(2, "Name must be at least 2 characters"),
  gender:         z.enum(["male", "female", "other"]),
  dateOfBirth:    z.string().min(1, "Date of birth is required"),
  height:         z.coerce.number().min(100).max(250),
  maritalStatus:  z.enum(["never_married", "divorced", "widowed", "separated"]),
  religion:       z.enum(["hindu", "muslim", "christian", "sikh", "jain", "buddhist", "jewish", "other"]),
  caste:          z.string().optional(),
  motherTongue:   z.string().optional(),
  nationality:    z.string().min(1, "Nationality is required"),
  country:        z.string().min(1, "Country is required"),
  state:          z.string().min(1, "State / Province is required"),
  city:           z.string().min(1, "City is required"),
  education:      z.string().min(1, "Education is required"),
  occupation:     z.string().min(1, "Occupation is required"),
  incomeCurrency: z.string().optional(),
  incomeAmount:   z.string().optional(),
  bio:            z.string().min(20, "Bio must be at least 20 characters").max(500),
  hobbies:        z.string().optional(),
  prefAgeMin:     z.coerce.number().min(18).max(80),
  prefAgeMax:     z.coerce.number().min(18).max(80),
});

type SetupFormData = z.infer<typeof setupSchema>;

const STEPS = ["Personal", "Location & Career", "About Me", "Preferences", "Photos"];

// ── Component ──────────────────────────────────────────────────────────────

export default function ProfileSetupPage() {
  useRequireAuth();
  const { user, refreshProfile, profileComplete } = useAuth();
  const router = useRouter();

  // If profile is already complete, skip setup and go to browse
  useEffect(() => {
    if (profileComplete) router.replace("/browse");
  }, [profileComplete, router]);

  const [step,       setStep]      = useState(0);
  const [photos,     setPhotos]    = useState<File[]>([]);
  const [previews,   setPreviews]  = useState<string[]>([]);
  const [saving,     setSaving]    = useState(false);
  const [saveStage,  setSaveStage] = useState("");

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    control,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      prefAgeMin:     22,
      prefAgeMax:     35,
      nationality:    "British",
      country:        "United Kingdom",
      incomeCurrency: "GBP",
    },
  });

  const selectedCountry = watch("country");
  const selectedState   = watch("state");

  const countryData = useMemo(
    () => GEO_DATA.find((c) => c.name === selectedCountry),
    [selectedCountry]
  );
  const stateData = useMemo(
    () => countryData?.states.find((s) => s.name === selectedState),
    [countryData, selectedState]
  );

  const stepFields: (keyof SetupFormData)[][] = [
    ["displayName", "gender", "dateOfBirth", "height", "maritalStatus", "religion"],
    ["nationality", "country", "state", "city", "education", "occupation"],
    ["bio"],
    ["prefAgeMin", "prefAgeMax"],
    [],
  ];

  async function nextStep() {
    const valid = await trigger(stepFields[step] as (keyof SetupFormData)[]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6 - photos.length);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPhotos((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removePhoto(idx: number) {
    URL.revokeObjectURL(previews[idx]);
    setPhotos((prev)   => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(data: SetupFormData) {
    if (!user) return;
    setSaving(true);

    try {
      // 1. Compress images before upload
      setSaveStage("Compressing photos…");
      const compressed = await compressImages(photos);

      // 2. Upload to Cloudinary
      const photoURLs: string[] = [];
      for (let i = 0; i < compressed.length; i++) {
        setSaveStage(`Uploading photo ${i + 1} of ${compressed.length}…`);
        const result = await uploadToCloudinary(compressed[i], "profiles");
        photoURLs.push(result.secure_url);
      }

      // 3. Save profile to Firestore
      setSaveStage("Saving your profile…");      const age = calcAge(data.dateOfBirth);

      // Build income string
      const incomeStr = data.incomeAmount && data.incomeCurrency
        ? `${data.incomeCurrency} ${Number(data.incomeAmount).toLocaleString()}`
        : "";

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid:             user.uid,
          displayName:     data.displayName,
          email:           user.email ?? "",
          photoURL:        photoURLs[0] ?? user.photoURL ?? null,
          photos:          photoURLs,
          updatedAt:       Date.now(),
          gender:          data.gender as Gender,
          dateOfBirth:     data.dateOfBirth,
          age,
          height:          data.height,
          maritalStatus:   data.maritalStatus as MaritalStatus,
          religion:        data.religion as Religion,
          caste:           data.caste ?? "",
          motherTongue:    data.motherTongue ?? "",
          nationality:     data.nationality,
          location:        { city: data.city, state: data.state, country: data.country },
          education:       data.education,
          occupation:      data.occupation,
          annualIncome:    incomeStr,
          bio:             data.bio,
          hobbies:         data.hobbies ? data.hobbies.split(",").map((h) => h.trim()).filter(Boolean) : [],
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
        },
        { merge: true }  // merge:true — won't fail if doc already exists
      );

      toast.success("Profile created! Welcome to Familiara 🎉");
      // Refresh profileComplete in context so useRequireAuth stops redirecting to setup
      await refreshProfile();
      router.push("/browse");
    } catch (err: unknown) {
      console.error("Profile save error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to save profile: ${msg}`);
    } finally {
      setSaving(false);
      setSaveStage("");
    }
  }

  return (
    <div className="max-w-2xl mx-auto relative">
      {/* Animated floating symbols */}
      <FloatingSymbols count={20} />
      {/* Progress stepper */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center mb-3">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300
                ${i < step  ? "bg-gradient-to-br from-primary-600 to-violet-600 text-white shadow-glow"
                : i === step ? "bg-gradient-to-br from-primary-600 to-violet-600 text-white ring-4 ring-primary-100 shadow-glow"
                : "bg-slate-100 text-slate-400"}`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${i < step ? "bg-gradient-to-r from-primary-500 to-violet-500" : "bg-slate-100"}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm font-semibold gradient-text">{STEPS[step]}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="relative z-10">
        <div className="card-gradient p-6 space-y-5 shadow-card">

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
                <Field label="Caste / Sect (optional)">
                  <input className="input" placeholder="e.g. Sunni, Brahmin…" {...register("caste")} />
                </Field>
              </div>
              <Field label="Mother Tongue (optional)">
                <input className="input" placeholder="e.g. Urdu, Hindi, Punjabi…" {...register("motherTongue")} />
              </Field>
            </>
          )}

          {/* ── Step 1: Location & Career ────────────────────────────── */}
          {step === 1 && (
            <>
              <Field label="Nationality" error={errors.nationality?.message}>
                <input className="input" placeholder="e.g. British, Pakistani…" {...register("nationality")} />
              </Field>

              {/* Country dropdown */}
              <Field label="Country" error={errors.country?.message}>
                <select className="input" {...register("country")}>
                  <option value="">Select country…</option>
                  {GEO_DATA.map((c) => (
                    <option key={c.code} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </Field>

              {/* State dropdown — filtered by country */}
              <Field label="State / Province / County" error={errors.state?.message}>
                {countryData ? (
                  <select className="input" {...register("state")}>
                    <option value="">Select state…</option>
                    {countryData.states.map((s) => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                ) : (
                  <input className="input" placeholder="Type your state / county…" {...register("state")} />
                )}
              </Field>

              {/* City dropdown — filtered by state */}
              <Field label="City" error={errors.city?.message}>
                {stateData ? (
                  <select className="input" {...register("city")}>
                    <option value="">Select city…</option>
                    {stateData.cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Other">Other (not listed)</option>
                  </select>
                ) : (
                  <input className="input" placeholder="Type your city…" {...register("city")} />
                )}
              </Field>

              <Field label="Education" error={errors.education?.message}>
                <select className="input" {...register("education")}>
                  <option value="">Select…</option>
                  {["High School","A-Levels / ICS","Bachelor's","Master's","PhD","Professional (MBBS / LLB / CA)","Other"].map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </Field>

              <Field label="Occupation" error={errors.occupation?.message}>
                <input className="input" placeholder="e.g. Software Engineer, Doctor…" {...register("occupation")} />
              </Field>

              {/* Annual income — currency + number */}
              <Field label="Annual Income (optional)">
                <div className="flex gap-2">
                  <select
                    className="input w-36 flex-shrink-0"
                    {...register("incomeCurrency")}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="input flex-1"
                    placeholder="Amount (e.g. 50000)"
                    min={0}
                    step={1000}
                    {...register("incomeAmount")}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Leave blank to keep private</p>
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
                <p className="text-xs text-slate-400 mt-1">Minimum 20 characters · max 500</p>
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
              <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 text-sm text-primary-700 mb-2">
                Set your basic partner preferences. You can refine these later.
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Partner Min Age" error={errors.prefAgeMin?.message}>
                  <input type="number" className="input" min={18} max={80} {...register("prefAgeMin")} />
                </Field>
                <Field label="Partner Max Age" error={errors.prefAgeMax?.message}>
                  <input type="number" className="input" min={18} max={80} {...register("prefAgeMax")} />
                </Field>
              </div>
            </>
          )}

          {/* ── Step 4: Photos ───────────────────────────────────────── */}
          {step === 4 && (
            <>
              <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 text-sm text-primary-700">
                Add up to 6 photos. Photos are automatically compressed before upload. Your first photo will be your main profile picture.
              </div>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group shadow-sm">
                    <Image src={src} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      ×
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 bg-gradient-to-r from-primary-600 to-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                        Main
                      </span>
                    )}
                  </div>
                ))}
                {previews.length < 6 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 group">
                    <Camera size={24} className="text-slate-300 group-hover:text-primary-400 transition-colors" />
                    <span className="text-xs text-slate-400 group-hover:text-primary-500 mt-1 transition-colors">Add photo</span>
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
                <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2 border border-amber-100">
                  At least one photo is recommended — profiles with photos get 5× more views.
                </p>
              )}
              {previews.length > 0 && (
                <p className="text-xs text-slate-400">
                  {previews.length}/6 photos added · Images will be compressed automatically before upload
                </p>
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
            className={`btn-outline ${step === 0 ? "opacity-0 pointer-events-none" : ""}`}
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={nextStep} className="btn-primary">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button type="submit" className="btn-primary min-w-[160px]" disabled={saving}>
              {saving ? (
                <><Loader2 size={15} className="animate-spin" /> {saveStage || "Saving…"}</>
              ) : (
                <><Check size={15} /> Complete Profile</>
              )}
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
      <label className="label block mb-1.5">{label}</label>
      {children}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
