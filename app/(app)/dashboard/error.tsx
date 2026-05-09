"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 neu-sm">
        <svg className="h-7 w-7 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <div>
        <p className="text-base font-semibold text-ink-1">Something went wrong</p>
        <p className="mt-1 text-sm text-ink-4">We couldn&apos;t load your dashboard. Please try again.</p>
      </div>
      <button
        onClick={reset}
        className="rounded-xl border border-line-2 px-5 py-2.5 text-sm font-medium text-ink-2 transition-all hover:border-ai/40 hover:text-ai neu-sm"
      >
        Try again
      </button>
    </div>
  );
}
