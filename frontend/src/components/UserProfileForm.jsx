import React, { useEffect, useState } from "react";
import { Check, Loader2, UserRound } from "lucide-react";
import { getUserProfile, updateUserProfile } from "@/services/api";

// Field metadata drives both the form and the saved payload. Keys mirror
// backend/services/memory_service.py DEFAULT_PROFILE so the whitelist accepts them.
const FIELDS = [
  { key: "name", label: "Name", placeholder: "e.g. Mahima", type: "input" },
  { key: "university", label: "University", placeholder: "e.g. UMBC", type: "input" },
  { key: "year", label: "Year", placeholder: "e.g. Junior", type: "input" },
  {
    key: "career_goal",
    label: "Career goal",
    placeholder: "e.g. Machine Learning Engineer",
    type: "input",
    hint: "Lumen ties each concept back to this goal in its Career Connection."
  },
  {
    key: "focus",
    label: "Focus & interests",
    placeholder: "e.g. STEM coursework, CS fundamentals, and ML career readiness",
    type: "textarea"
  }
];

const emptyProfile = () =>
  FIELDS.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {});

export default function UserProfileForm() {
  const [profile, setProfile] = useState(emptyProfile);
  const [status, setStatus] = useState("loading"); // loading | ready | saving | saved | error
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loaded = await getUserProfile();
        if (cancelled) return;
        setProfile((prev) => ({ ...prev, ...loaded }));
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setError("Couldn't load your profile. Is the backend running?");
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    if (status === "saved") setStatus("ready");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (status === "saving") return;
    setStatus("saving");
    setError("");
    try {
      const saved = await updateUserProfile(profile);
      setProfile((prev) => ({ ...prev, ...saved }));
      setStatus("saved");
    } catch {
      setError("Couldn't save your profile. Check the backend connection and try again.");
      setStatus("error");
    }
  };

  const isLoading = status === "loading";
  const isSaving = status === "saving";

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-3">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <UserRound className="h-3.5 w-3.5 text-yellow-400" />
          About you
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">
          Share a few details and Lumen will personalize its answers — especially the Career
          Connection that ties each concept to your goals.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {FIELDS.map((field) => (
          <label key={field.key} className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              {field.label}
            </span>
            {field.type === "textarea" ? (
              <textarea
                value={profile[field.key] ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={2}
                disabled={isLoading}
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-yellow-400/50 focus:outline-none disabled:opacity-50"
              />
            ) : (
              <input
                type="text"
                value={profile[field.key] ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                disabled={isLoading}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-yellow-400/50 focus:outline-none disabled:opacity-50"
              />
            )}
            {field.hint && <span className="text-[11px] text-zinc-600">{field.hint}</span>}
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isLoading || isSaving}
          className="inline-flex items-center gap-1.5 rounded-lg border border-yellow-400/40 bg-yellow-400/10 px-3 py-1.5 text-xs font-semibold text-yellow-400 transition-colors hover:bg-yellow-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {status === "saved" && <Check className="h-3.5 w-3.5" />}
          {isSaving ? "Saving..." : status === "saved" ? "Saved" : "Save profile"}
        </button>
        {status === "error" && <span className="text-[11px] text-red-400">{error}</span>}
        {status === "ready" && (
          <span className="text-[11px] text-zinc-600">Changes apply to your next message.</span>
        )}
      </div>
    </form>
  );
}
