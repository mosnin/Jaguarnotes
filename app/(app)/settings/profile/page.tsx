"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ProfileSettingsPage() {
  const { user, isLoaded } = useUser();
  const me = useQuery(api.users.getMe) as { role?: string; name?: string; email?: string } | null | undefined;

  if (!isLoaded || me === undefined) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-1">Profile</h1>
        <p className="mt-1 text-sm text-ink-4">Your account information managed by Clerk.</p>
      </div>

      {/* Avatar + name card */}
      <div className="rounded-2xl bg-surface p-6 neu-card">
        <div className="flex items-center gap-4">
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt={user.fullName ?? "Avatar"}
              className="h-16 w-16 rounded-2xl object-cover neu-sm"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ai-dim text-2xl font-bold text-ai neu-sm">
              {user?.firstName?.[0] ?? "?"}
            </div>
          )}
          <div>
            <p className="text-base font-semibold text-ink-1">{user?.fullName ?? "—"}</p>
            <p className="text-sm text-ink-3">{user?.primaryEmailAddress?.emailAddress ?? "—"}</p>
            <p className="mt-0.5 text-xs text-ink-4">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-ink-4">
          Name and avatar are managed through your Clerk account.{" "}
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

      {/* Details */}
      <div className="rounded-2xl bg-surface p-6 neu-card">
        <h2 className="mb-4 text-sm font-semibold text-ink-2">Details</h2>
        <div className="space-y-4">
          <Field label="Full name" value={user?.fullName ?? "—"} />
          <Field label="Email" value={user?.primaryEmailAddress?.emailAddress ?? "—"} />
          <Field label="Role" value={me?.role ? capitalize(me.role) : "Not set"} />
          <Field label="User ID" value={user?.id ?? "—"} mono />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-1 pb-3 last:border-0 last:pb-0">
      <span className="shrink-0 text-xs text-ink-4">{label}</span>
      <span className={`truncate text-sm text-ink-2 ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="max-w-xl space-y-6">
      <div className="h-8 w-32 rounded-lg bg-line-1 animate-pulse" />
      <div className="h-32 rounded-2xl bg-line-1 animate-pulse" />
      <div className="h-48 rounded-2xl bg-line-1 animate-pulse" />
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
