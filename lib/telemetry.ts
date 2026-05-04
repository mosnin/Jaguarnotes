type ErrorContext = string;

export function trackError(context: ErrorContext, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  const payload = {
    context,
    message,
    stack,
    url: typeof window !== "undefined" ? window.location.href : "server",
    ts: Date.now(),
  };

  if (process.env.NODE_ENV !== "production") {
    console.error(`[jn:${context}]`, message, err);
    return;
  }

  // In production: fire-and-forget via sendBeacon (doesn't block navigation)
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/errors", JSON.stringify(payload));
  }
}
