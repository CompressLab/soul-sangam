"use client";

import { useState, useEffect } from "react";
import {
  collection, query, where,
  limit, getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { UserProfile } from "@shared/types";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { SlidersHorizontal, Search, X, Sparkles } from "lucide-react";

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
  useRequireAuth();  // just check auth, don't enforce profile completion on browse
  const { user } = useAuth();

  const [profiles,     setProfiles]     = useState<UserProfile[]>([]);
  const [loading,      setLoading]      = useState(true);
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
      // Simplified query — fetch all complete visible profiles, filter client-side
      const q = query(
        collection(db, "users"),
        where("profileComplete", "==", true),
        limit(PAGE_SIZE)
      );

      const snap = await getDocs(q);
      console.log(`[Browse] Firestore returned ${snap.docs.length} docs`);

      const docs = snap.docs
        .map((d) => {
          const data = d.data() as UserProfile;
          console.log(`[Browse] doc uid=${data.uid} visible=${data.profileVisible} complete=${data.profileComplete} age=${data.age}`);
          return data;
        })
        .filter((p) => {
          const keep =
            p.uid !== user.uid &&
            p.profileVisible !== false &&
            (!filters.gender   || p.gender   === filters.gender) &&
            (!filters.religion || p.religion === filters.religion) &&
            (!filters.country  || p.location?.country === filters.country) &&
            (p.age ?? 0) >= filters.ageMin &&
            (p.age ?? 99) <= filters.ageMax;
          if (!keep) console.log(`[Browse] filtered out uid=${p.uid}`);
          return keep;
        });

      console.log(`[Browse] after client filter: ${docs.length} profiles`);
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
        p.location?.city?.toLowerCase().includes(searchCity.toLowerCase()) ?? false
      )
    : profiles;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900">Browse Profiles</h1>
            <span className="tag">{displayed.length} found</span>
          </div>
          <p className="text-sm text-slate-500">Discover compatible matches</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-8 w-44 text-sm"
              placeholder="Search city…"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={`btn-outline flex items-center gap-1.5 text-sm ${showFilters ? "bg-primary-50 border-primary-300" : ""}`}
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card-gradient p-5 mb-6 grid grid-cols-2 md:grid-cols-5 gap-3 shadow-card">
          <div>
            <label className="label block mb-1 text-xs uppercase tracking-wide text-slate-500">Gender</label>
            <select className="input text-sm" value={filters.gender} onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value }))}>
              <option value="">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="label block mb-1 text-xs uppercase tracking-wide text-slate-500">Religion</label>
            <select className="input text-sm" value={filters.religion} onChange={(e) => setFilters((f) => ({ ...f, religion: e.target.value }))}>
              <option value="">Any</option>
              {["hindu","muslim","christian","sikh","jain","buddhist","jewish","other"].map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label block mb-1 text-xs uppercase tracking-wide text-slate-500">Age Min</label>
            <input type="number" min={18} max={80} className="input text-sm" value={filters.ageMin} onChange={(e) => setFilters((f) => ({ ...f, ageMin: +e.target.value }))} />
          </div>
          <div>
            <label className="label block mb-1 text-xs uppercase tracking-wide text-slate-500">Age Max</label>
            <input type="number" min={18} max={80} className="input text-sm" value={filters.ageMax} onChange={(e) => setFilters((f) => ({ ...f, ageMax: +e.target.value }))} />
          </div>
          <div>
            <label className="label block mb-1 text-xs uppercase tracking-wide text-slate-500">Country</label>
            <input className="input text-sm" placeholder="e.g. UK" value={filters.country} onChange={(e) => setFilters((f) => ({ ...f, country: e.target.value }))} />
          </div>
          <div className="col-span-2 md:col-span-5 flex justify-end">
            <button className="btn-ghost text-xs text-red-400 hover:text-red-600" onClick={() => { setFilters(DEFAULT_FILTERS); setSearchCity(""); }}>
              <X size={13} /> Reset filters
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading && profiles.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl aspect-[3/4] animate-pulse bg-gradient-to-br from-slate-100 to-slate-200" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-violet-100 flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-primary-400" />
          </div>
          <p className="text-lg font-bold text-slate-700">No profiles found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
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
