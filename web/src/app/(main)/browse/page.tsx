"use client";

import { useState, useEffect } from "react";
import {
  collection, query, where, orderBy,
  limit, getDocs, startAfter, DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@shared/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { UserProfile } from "@shared/types";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { SlidersHorizontal, Search, X } from "lucide-react";

const PAGE_SIZE = 12;

interface Filters {
  gender:     string;
  religion:   string;
  ageMin:     number;
  ageMax:     number;
  country:    string;
}

const DEFAULT_FILTERS: Filters = {
  gender:   "",
  religion: "",
  ageMin:   18,
  ageMax:   60,
  country:  "",
};

export default function BrowsePage() {
  useRequireAuth();
  const { user } = useAuth();

  const [profiles,     setProfiles]     = useState<UserProfile[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [lastDoc,      setLastDoc]      = useState<DocumentSnapshot | null>(null);
  const [hasMore,      setHasMore]      = useState(true);
  const [filters,      setFilters]      = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters,  setShowFilters]  = useState(false);
  const [searchCity,   setSearchCity]   = useState("");

  useEffect(() => {
    fetchProfiles(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function fetchProfiles(reset = false) {
    if (!user) return;
    setLoading(true);

    try {
      // Build query — we exclude the current user's own profile
      const constraints: Parameters<typeof query>[1][] = [
        where("profileVisible", "==", true),
        where("profileComplete", "==", true),
        where("uid", "!=", user.uid),
      ];

      if (filters.gender)   constraints.push(where("gender",   "==", filters.gender));
      if (filters.religion) constraints.push(where("religion", "==", filters.religion));
      if (filters.country)  constraints.push(where("location.country", "==", filters.country));

      constraints.push(where("age", ">=", filters.ageMin));
      constraints.push(where("age", "<=", filters.ageMax));
      constraints.push(orderBy("uid")); // uid lets us paginate without composite index issues
      constraints.push(limit(PAGE_SIZE));

      if (!reset && lastDoc) constraints.push(startAfter(lastDoc));

      const q   = query(collection(db, "users"), ...constraints);
      const snap = await getDocs(q);

      const docs = snap.docs.map((d) => d.data() as UserProfile);

      setProfiles((prev) => reset ? docs : [...prev, ...docs]);
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error("Browse query error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Client-side city filter (avoid extra Firestore index for MVP)
  const displayed = searchCity
    ? profiles.filter((p) =>
        p.location.city.toLowerCase().includes(searchCity.toLowerCase())
      )
    : profiles;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Browse Profiles</h1>
          <p className="text-sm text-gray-500">{displayed.length} profiles found</p>
        </div>
        <div className="flex items-center gap-2">
          {/* City search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-8 w-40 text-sm"
              placeholder="Search city…"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={`btn-outline flex items-center gap-1.5 text-sm ${showFilters ? "bg-primary-50" : ""}`}
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-4 mb-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="label block mb-1 text-xs">Gender</label>
            <select
              className="input text-sm"
              value={filters.gender}
              onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value }))}
            >
              <option value="">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="label block mb-1 text-xs">Religion</label>
            <select
              className="input text-sm"
              value={filters.religion}
              onChange={(e) => setFilters((f) => ({ ...f, religion: e.target.value }))}
            >
              <option value="">Any</option>
              {["hindu","muslim","christian","sikh","jain","buddhist","jewish","other"].map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label block mb-1 text-xs">Age Min</label>
            <input
              type="number" min={18} max={80}
              className="input text-sm"
              value={filters.ageMin}
              onChange={(e) => setFilters((f) => ({ ...f, ageMin: +e.target.value }))}
            />
          </div>
          <div>
            <label className="label block mb-1 text-xs">Age Max</label>
            <input
              type="number" min={18} max={80}
              className="input text-sm"
              value={filters.ageMax}
              onChange={(e) => setFilters((f) => ({ ...f, ageMax: +e.target.value }))}
            />
          </div>
          <div>
            <label className="label block mb-1 text-xs">Country</label>
            <input
              className="input text-sm"
              placeholder="e.g. UK"
              value={filters.country}
              onChange={(e) => setFilters((f) => ({ ...f, country: e.target.value }))}
            />
          </div>
          <div className="col-span-2 md:col-span-5 flex justify-end">
            <button
              className="btn-ghost text-xs text-red-500"
              onClick={() => { setFilters(DEFAULT_FILTERS); setSearchCity(""); }}
            >
              <X size={13} /> Reset filters
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading && profiles.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card aspect-[3/4] animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">No profiles found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayed.map((profile) => (
              <ProfileCard key={profile.uid} profile={profile} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => fetchProfiles(false)}
                disabled={loading}
                className="btn-outline"
              >
                {loading ? "Loading…" : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
