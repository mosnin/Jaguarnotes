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
        <h2 className="mb-1 text-sm font-semibold text-ink-2">Your role</h2>
        <p className="mb-4 text-xs text-ink-4">Determines which AI quick actions appear on your dashboard.</p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`rounded-full border px-3 py-1.5 text-sm capitalize transition-all ${
                role === r
                  ? "border-ai/40 bg-ai-dim text-ai neu-pressed"
                  : "border-line-2 text-ink-3 hover:border-line-3 hover:text-ink-2 neu-sm"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Use cases */}
      <div className="rounded-2xl bg-surface p-6 neu-card">
        <h2 className="mb-1 text-sm font-semibold text-ink-2">What do you use notes for?</h2>
        <p className="mb-4 text-xs text-ink-4">Select all that apply. Used to personalize AI suggestions.</p>
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
                className={`rounded-full border px-3 py-1.5 text-sm transition-all ${
                  active
                    ? "border-ai/40 bg-ai-dim text-ai neu-pressed"
                    : "border-line-2 text-ink-3 hover:border-line-3 hover:text-ink-2 neu-sm"
                }`}
              >
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
        className="flex items-center gap-2 rounded-xl border border-ai/30 bg-ai-dim px-5 py-2.5 text-sm font-medium text-ai transition-all hover:bg-ai-dim/80 disabled:opacity-50 neu-btn"
      >
        {saving ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ai border-t-transparent" />
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
