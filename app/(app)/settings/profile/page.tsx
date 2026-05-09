"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { buttonTap } from "@/lib/motion";

export default function ProfileSettingsPage() {
  const { user, isLoaded } = useUser();
  const me = useQuery(api.users.getMe) as { role?: string; name?: string; email?: string } | null | undefined;
  const updatePreferences = useMutation(api.users.updatePreferences);

  const userName = user?.fullName ?? me?.name ?? "";
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? me?.email ?? "";

  const [role, setRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    if (me) {
      setRole(me.role ?? "");
    }
  }, [me?.role]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoaded || me === undefined) {
    return <SettingsSkeleton />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveResult(null);
    try {
      await updatePreferences({ role: role || undefined });
      setSaveResult("success");
    } catch {
      setSaveResult("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-ink-1">Profile</h1>
        <p className="mt-1 text-sm text-ink-3">Manage your personal information.</p>
      </div>

      {/* Main card */}
      <div className="rounded-2xl bg-surface p-6 neu-card">

        {/* Avatar section */}
        <div className="mb-6 flex items-center gap-4">
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt={userName || "Avatar"}
              className="h-16 w-16 rounded-2xl object-cover neu-sm"
            />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white neu-sm"
              style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
            >
              {(userName || userEmail || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-base font-bold text-ink-1">{userName || "Your Name"}</p>
            <p className="text-sm text-ink-3">{userEmail}</p>
          </div>
        </div>

        <div className="my-4 border-t border-line-1" />

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Display name */}
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wide text-ink-2 mb-1.5">
              Display name
            </label>
            <input
              type="text"
              value={userName}
              disabled
              placeholder="Your name"
              className="w-full rounded-xl border border-line-2 bg-raised px-4 py-2.5 text-sm text-ink-1 placeholder-ink-4 outline-none transition-all focus:border-ai/50 focus:ring-2 focus:ring-ai/10 neu-inset disabled:cursor-not-allowed disabled:opacity-60"
            />
            <p className="mt-1.5 text-xs text-ink-4">
              Managed via your Clerk account.{" "}
              <a
                href="https://accounts.clerk.com/user"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ai underline underline-offset-2 hover:opacity-80"
              >
                Edit on Clerk →
              </a>
            </p>
          </div>

          <div className="my-4 border-t border-line-1" />

          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wide text-ink-2 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={userEmail}
              disabled
              placeholder="you@example.com"
              className="w-full rounded-xl border border-line-2 bg-raised px-4 py-2.5 text-sm text-ink-1 placeholder-ink-4 outline-none transition-all focus:border-ai/50 focus:ring-2 focus:ring-ai/10 neu-inset disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="my-4 border-t border-line-1" />

          {/* Role */}
          <div className="mb-4">
            <label htmlFor="profile-role" className="block text-xs font-bold uppercase tracking-wide text-ink-2 mb-1.5">
              Role
            </label>
            <input
              id="profile-role"
              type="text"
              value={role}
              onChange={(e) => { setRole(e.target.value); setSaveResult(null); }}
              placeholder="e.g. researcher, founder, writer…"
              className="w-full rounded-xl border border-line-2 bg-raised px-4 py-2.5 text-sm text-ink-1 placeholder-ink-4 outline-none transition-all focus:border-ai/50 focus:ring-2 focus:ring-ai/10 neu-inset"
            />
          </div>

          <div className="my-4 border-t border-line-1" />

          {/* User ID */}
          <div className="mb-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-ink-2 mb-1.5">
              User ID
            </label>
            <input
              type="text"
              value={user?.id ?? "—"}
              disabled
              className="w-full rounded-xl border border-line-2 bg-raised px-4 py-2.5 font-mono text-xs text-ink-3 outline-none transition-all neu-inset disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Member since */}
          {user?.createdAt && (
            <p className="mt-2 text-xs text-ink-4">
              Member since{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          )}

          {/* Save button */}
          <motion.button
            type="submit"
            {...buttonTap}
            whileTap={{ scale: 0.97 }}
            disabled={saving}
            className="mt-6 flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 neu-btn"
            style={{ backgroundColor: "#2563EB" }}
          >
            {saving ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </motion.button>

          {/* Inline feedback */}
          {saveResult === "success" && (
            <p className="mt-3 flex items-center gap-1 text-xs font-medium text-ok">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Saved
            </p>
          )}
          {saveResult === "error" && (
            <p className="mt-3 text-xs font-medium text-error">Failed to save.</p>
          )}
        </form>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="max-w-xl space-y-6">
      <div className="h-8 w-32 rounded-lg bg-line-1 animate-pulse" />
      <div className="h-96 rounded-2xl bg-line-1 animate-pulse" />
    </div>
  );
}
