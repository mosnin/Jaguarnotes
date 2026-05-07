"use client";

import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { motion } from "framer-motion";
import { buttonTap } from "@/lib/motion";

export default function AccountPage() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDanger, setShowDanger] = useState(false);

  const deleteAllNotes = useMutation(api.notes.deleteAllForUser);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  async function handleDeleteData() {
    if (confirmText !== "delete my data") return;
    setDeleting(true);
    try {
      await deleteAllNotes();
      await signOut();
      router.push("/");
      toast.success("All data deleted");
    } catch {
      toast.error("Failed to delete data. Please try again.");
      setDeleting(false);
    }
  }

  const confirmMatch = confirmText === "delete my data";

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-1">Account</h1>
        <p className="mt-1 text-sm text-ink-3">Manage your session and account data.</p>
      </div>

      {/* Sign out */}
      <div className="rounded-2xl bg-surface p-6 neu-card">
        <h2 className="mb-1 text-sm font-bold text-ink-1">Session</h2>
        <p className="mb-5 text-xs text-ink-3">
          Signed in as{" "}
          <span className="font-semibold text-ink-2">{user?.primaryEmailAddress?.emailAddress}</span>
        </p>
        <motion.button
          {...buttonTap}
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-xl border border-line-2 bg-raised px-4 py-2.5 text-sm font-medium text-ink-2 transition-all hover:border-line-3 hover:text-ink-1 neu-btn"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Sign out
        </motion.button>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border-2 bg-surface p-6 transition-all" style={{ borderColor: "rgba(220,38,38,0.5)" }}>
        <div className="mb-4 flex items-center gap-2">
          <svg className="h-4 w-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <h2 className="text-sm font-bold text-error">Danger zone</h2>
        </div>
        <p className="mb-4 text-xs text-ink-3">
          Permanently delete all your notes and account data. This action cannot be undone.
        </p>

        {!showDanger ? (
          <button
            onClick={() => setShowDanger(true)}
            className="rounded-xl border border-error/40 px-4 py-2.5 text-sm font-medium text-error transition-all hover:bg-error/5 hover:border-error/60"
          >
            Delete all my data
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-ink-2">
              Type{" "}
              <code className="rounded bg-error/10 px-1.5 py-0.5 font-mono text-xs font-bold text-error">
                delete my data
              </code>{" "}
              to confirm.
            </p>
            <div className="relative">
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="delete my data"
                className="w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-ink-1 placeholder-ink-4 outline-none transition-all neu-inset"
                style={{
                  borderColor: confirmText.length === 0
                    ? "rgba(220,38,38,0.3)"
                    : confirmMatch
                      ? "rgba(22,163,74,0.5)"
                      : "rgba(220,38,38,0.4)",
                }}
              />
              {/* Real-time match indicator */}
              {confirmText.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {confirmMatch ? (
                    <svg className="h-4 w-4 text-ok" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-error opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteData}
                disabled={!confirmMatch || deleting}
                className="flex items-center gap-2 rounded-xl bg-error px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deleting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Deleting…
                  </>
                ) : (
                  "Permanently delete"
                )}
              </button>
              <button
                onClick={() => { setShowDanger(false); setConfirmText(""); }}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-ink-3 transition-colors hover:text-ink-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
