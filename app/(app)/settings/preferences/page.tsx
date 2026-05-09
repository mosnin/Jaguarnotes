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

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm font-medium text-ink-2">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative flex h-6 w-11 shrink-0 items-center rounded-full transition-all duration-200"
        style={{ background: checked ? "#2563EB" : "var(--color-line-3)" }}
      >
        <span
          className="absolute h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{ transform: checked ? "translateX(21px)" : "translateX(2px)" }}
        />
      </button>
    </label>
  );
}

export default function PreferencesPage() {
  const me = useQuery(api.users.getMe) as
    | { role?: string; useCases?: string[] }
    | null
    | undefined;
  const updatePreferences = useMutation(api.users.updatePreferences);

  const [role, setRole] = useState("");
  const [useCases, setUseCases] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // AI feature toggles — UI-only state (no backend field yet)
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(true);
  const [webContextEnabled, setWebContextEnabled] = useState(true);
  const [streamingEnabled, setStreamingEnabled] = useState(true);

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
    <div className="max-w-xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink-1">Preferences</h1>
        <p className="mt-1 text-sm text-ink-3">
          Customize your Jaguarnotes experience.
        </p>
      </div>

      {/* Role */}
      <div className="rounded-2xl bg-surface p-6 neu-card mb-4">
        <h2 className="text-sm font-bold text-ink-1 mb-4">Your role</h2>
        <p className="mb-4 text-xs text-ink-3">
          Determines which AI quick actions appear on your dashboard.
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {ROLES.map((r) => {
            const selected = role === r;
            return (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={[
                  "rounded-xl border p-3 cursor-pointer transition-all text-sm font-medium capitalize",
                  selected
                    ? "border-blue-400/40 bg-blue-50 text-blue-600 neu-sm"
                    : "border-line-2 text-ink-2 hover:border-line-3 hover:bg-raised",
                ].join(" ")}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Use cases */}
      <div className="rounded-2xl bg-surface p-6 neu-card mb-4">
        <h2 className="text-sm font-bold text-ink-1 mb-4">
          What do you use notes for?
        </h2>
        <p className="mb-4 text-xs text-ink-3">
          Select all that apply. Used to personalize AI suggestions.
        </p>
        <div className="grid grid-cols-2 gap-2">
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
                className={[
                  "rounded-xl border p-3 cursor-pointer transition-all text-sm font-medium text-left flex items-center gap-2",
                  active
                    ? "border-blue-400/40 bg-blue-50 text-blue-600 neu-sm"
                    : "border-line-2 text-ink-2 hover:border-line-3 hover:bg-raised",
                ].join(" ")}
              >
                {active && (
                  <svg
                    className="h-3.5 w-3.5 shrink-0 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                )}
                {uc}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI features */}
      <div className="rounded-2xl bg-surface p-6 neu-card mb-4">
        <h2 className="text-sm font-bold text-ink-1 mb-4">AI features</h2>
        <div className="space-y-5">
          <Toggle
            checked={autocompleteEnabled}
            onChange={setAutocompleteEnabled}
            label="Inline autocomplete (Tab)"
          />
          <div className="h-px bg-line-1" />
          <Toggle
            checked={webContextEnabled}
            onChange={setWebContextEnabled}
            label="Live web context for AI commands"
          />
          <div className="h-px bg-line-1" />
          <Toggle
            checked={streamingEnabled}
            onChange={setStreamingEnabled}
            label="Stream AI responses in real time"
          />
        </div>
      </div>

      {/* Save */}
      <motion.button
        {...buttonTap}
        onClick={handleSave}
        disabled={saving}
        className="mt-6 flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 neu-btn hover:opacity-90"
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
      <div className="h-40 rounded-2xl bg-line-1 animate-pulse" />
    </div>
  );
}
