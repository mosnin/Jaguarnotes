"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");

  const shareInfo = useQuery(api.shares.getByToken, { token });
  const accept = useMutation(api.shares.accept);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace(`/sign-in?redirect_url=/invite/${token}`);
    }
  }, [isLoaded, isSignedIn, router, token]);

  // Accept the invite once signed in and share info loaded
  useEffect(() => {
    if (!isSignedIn || shareInfo === undefined || accepted) return;
    if (shareInfo === null) { setError("This invite link is invalid or has been revoked."); return; }

    accept({ token })
      .then((noteId) => {
        setAccepted(true);
        router.replace(`/notes/${noteId}`);
      })
      .catch(() => setError("Failed to accept invite. Please try again."));
  }, [isSignedIn, shareInfo, accepted, accept, token, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app px-6 text-center">
        <p className="text-sm text-ink-2">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-lg bg-raised px-4 py-2 text-sm text-ink-2 transition-colors hover:bg-hover hover:text-ink-1"
        >
          Go to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-app px-6 text-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-raised border-t-ai" />
      <p className="text-sm text-ink-4">
        {!isLoaded || !isSignedIn
          ? "Redirecting to sign in…"
          : shareInfo === undefined
          ? "Loading invite…"
          : `Opening "${shareInfo.note.title || "Untitled"}"…`}
      </p>
    </div>
  );
}
