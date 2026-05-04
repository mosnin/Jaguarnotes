import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/invite/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  const res = NextResponse.next();

  // Security headers on all API routes
  if (req.nextUrl.pathname.startsWith("/api/")) {
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // CSRF: reject non-GET requests from cross-origin referrers
    if (req.method !== "GET" && req.method !== "HEAD") {
      const origin = req.headers.get("origin");
      const host = req.headers.get("host");
      if (origin && host && !origin.includes(host)) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }

  return res;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
