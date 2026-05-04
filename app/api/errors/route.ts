import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // In production this would forward to Sentry/Datadog/etc.
    // For now: structured log to stdout (captured by Vercel/hosting platform)
    console.error("[telemetry]", JSON.stringify({
      ...body,
      ip: req.headers.get("x-forwarded-for") ?? "unknown",
      userAgent: req.headers.get("user-agent") ?? "unknown",
    }));
  } catch {
    // Never let telemetry crash the process
  }
  return new Response(null, { status: 204 });
}
