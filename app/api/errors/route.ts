import { NextRequest } from "next/server";

const errRl = new Map<string, number[]>();
function errAllowed(ip: string): boolean {
  const now = Date.now();
  const ts = (errRl.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (ts.length >= 30) return false; // 30 error reports/min per IP
  ts.push(now);
  errRl.set(ip, ts);
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!errAllowed(ip)) {
    return new Response(null, { status: 429 });
  }

  try {
    const body = await req.json();
    // In production this would forward to Sentry/Datadog/etc.
    // For now: structured log to stdout (captured by Vercel/hosting platform)
    console.error("[telemetry]", JSON.stringify({
      ...body,
      ip,
      userAgent: req.headers.get("user-agent") ?? "unknown",
    }));
  } catch {
    // Never let telemetry crash the process
  }
  return new Response(null, { status: 204 });
}
