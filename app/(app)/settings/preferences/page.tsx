"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "@/lib/toast";
import { motion } from "framer-motion";
import { buttonTap } from "@/lib/motion";

const ROLES = ["researcher", "founder", "writer", "student", "other"];
const USE_CASES = [
  "Research & analysis",
  "Project planning",
  "Meeting notes",
  "Brainstorming",
  "Learning & studying",
  "Writing & editing",
  "Strategy & decisions",
  "Personal journaling",
];

export default function PreferencesPage() {
  const me = useQuery(api.users.getMe) as { role?: string; useCases?: string[] } | null | undefined;
  const updatePreferences = useMutation(api.users.updatePreferences);

  const [role, setRole] = useState("");
  const [useCases, setUseCases] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (me) {
      setRole(me.role ?? "");
      setUseCases(me.useCases ?? []);
    }
  }, [me?.role, me?.useCases]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    setSaving(true);
    try {
      await updatePreferences({ role, useCases });
      toast.success("Preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }

  if (me === undefined) return <SettingsSkeleton />;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-1">Preferences</h1>
        <p className="mt-1 text-sm text-ink-4">Personalize your AI experience. These settings affect which commands are suggested first.</p>
      </div>

      {/* Role */}
      <div className="rounded-2xl bg-surface p-6 neu-card">
        <h2 className="mb-1 text-sm font-bold text-ink-1">Your role</h2>
        <p className="mb-4 text-xs text-ink-3">Determines which AI quick actions appear on your dashboard.</p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className="rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-all"
              style={
                role === r
                  ? { borderColor: "#2563EB", background: "#2563EB", color: "white", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }
                  : { borderColor: "#C2D5EB", color: "#4A6D8C", background: "transparent" }
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Use cases */}
      <div className="rounded-2xl bg-surface p-6 neu-card">
        <h2 className="mb-1 text-sm font-bold text-ink-1">What do you use notes for?</h2>
        <p className="mb-4 text-xs text-ink-3">Select all that apply. Used to personalize AI suggestions.</p>
        <div className="flex flex-wrap gap-2">
          {USE_CASES.map((uc) => {
            const active = useCases.includes(uc);
            return (
              <button
                key={uc}
                onClick={() =>
                  setUseCases((prev) =>
                    active ? prev.filter((x) => x !== uc) : [...prev, uc]
                  )
                }
                className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all"
                style={
                  active
                    ? { borderColor: "#2563EB", background: "#2563EB", color: "white", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }
                    : { borderColor: "#C2D5EB", color: "#4A6D8C", background: "transparent" }
                }
              >
                {active && (
                  <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
                {uc}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <motion.button
        {...buttonTap}
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 neu-btn"
        style={{ backgroundColor: "#2563EB" }}
      >
        {saving ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Saving…
          </>
        ) : (
          "Save preferences"
        )}
      </motion.button>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="max-w-xl space-y-6">
      <div className="h-8 w-40 rounded-lg bg-line-1 animate-pulse" />
      <div className="h-40 rounded-2xl bg-line-1 animate-pulse" />
      <div className="h-48 rounded-2xl bg-line-1 animate-pulse" />
    </div>
  );
}
