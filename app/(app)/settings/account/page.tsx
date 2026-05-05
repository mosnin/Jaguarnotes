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

  // Mutations for data deletion
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

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-1">Account</h1>
        <p className="mt-1 text-sm text-ink-4">Manage your session and account data.</p>
      </div>

      {/* Sign out */}
      <div className="rounded-2xl bg-surface p-6 neu-card">
        <h2 className="mb-1 text-sm font-semibold text-ink-2">Session</h2>
        <p className="mb-4 text-xs text-ink-4">
          Signed in as <span className="font-medium text-ink-2">{user?.primaryEmailAddress?.emailAddress}</span>
        </p>
        <motion.button
          {...buttonTap}
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-xl border border-line-2 px-4 py-2.5 text-sm text-ink-2 transition-all hover:border-line-3 hover:text-ink-1 neu-btn"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Sign out
        </motion.button>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-error/20 bg-surface p-6">
        <h2 className="mb-1 text-sm font-semibold text-error">Danger zone</h2>
        <p className="mb-4 text-xs text-ink-4">
          Permanently delete all your notes and data. This cannot be undone.
        </p>

        {!showDanger ? (
          <button
            onClick={() => setShowDanger(true)}
            className="rounded-xl border border-error/30 px-4 py-2.5 text-sm text-error transition-all hover:bg-error/5"
          >
            Delete all my data
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-ink-3">
              Type <span className="font-mono font-semibold text-error">delete my data</span> to confirm.
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete my data"
              className="w-full rounded-xl border border-error/30 bg-surface px-4 py-2.5 text-sm text-ink-1 placeholder-ink-4 outline-none focus:border-error/60 neu-inset"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteData}
                disabled={confirmText !== "delete my data" || deleting}
                className="flex items-center gap-2 rounded-xl bg-error px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-40"
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
                className="px-4 py-2.5 text-sm text-ink-4 hover:text-ink-2"
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
