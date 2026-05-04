import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AnimatedDemo } from "@/components/landing/animated-demo";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-app">
      {/* Single, confident glow — not decoration, just depth */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-ai/[0.07] blur-[140px]" />

      {/* Nav */}
      <nav className="relative z-10 flex w-full items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7474ff] to-violet-500">
            <span className="text-xs font-bold text-white">J</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-ink-1">Jaguarnotes</span>
        </div>

        <div className="flex items-center gap-4">
          <SignedOut>
            <Link href="/sign-in" className="text-sm text-ink-3 transition-colors hover:text-ink-1">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-ink-1 px-4 py-2 text-sm font-semibold text-app transition-opacity hover:opacity-85"
            >
              Get started
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-lg bg-ink-1 px-4 py-2 text-sm font-semibold text-app transition-opacity hover:opacity-85"
            >
              Open app
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center px-6 pb-32 pt-20 text-center md:pt-28">

        {/* Headline */}
        <h1 className="mx-auto max-w-2xl text-6xl font-bold leading-[1.05] tracking-tight text-ink-1 md:text-7xl lg:text-8xl">
          Think out loud.
        </h1>
        <p className="mt-4 text-xl font-normal text-ink-3 md:text-2xl">
          The AI writes the rest.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex items-center gap-4">
          <SignedOut>
            <Link
              href="/sign-up"
              className="rounded-xl bg-ink-1 px-8 py-3.5 text-sm font-semibold text-app transition-opacity hover:opacity-85"
            >
              Start for free
            </Link>
            <Link
              href="/sign-in"
              className="text-sm text-ink-3 transition-colors hover:text-ink-1"
            >
              Sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-xl bg-ink-1 px-8 py-3.5 text-sm font-semibold text-app transition-opacity hover:opacity-85"
            >
              Open workspace
            </Link>
          </SignedIn>
        </div>

        {/* Live animated demo */}
        <AnimatedDemo />

        {/* Three truths */}
        <div className="mx-auto mt-32 w-full max-w-3xl">
          <div className="grid gap-16 text-left sm:grid-cols-3">
            {[
              {
                label: "Tab to think",
                body: "Expand any concept inline. No context switch. No copy-paste. The AI completes the thought.",
              },
              {
                label: "13 AI commands",
                body: "Generate, compress, punch, counter, brief — each one a scoped agent with a single job.",
              },
              {
                label: "Real-time, everywhere",
                body: "Convex keeps every note live across all devices. PWA-ready. Always in sync.",
              },
            ].map((f) => (
              <div key={f.label}>
                <p className="mb-2 text-sm font-semibold text-ink-1">{f.label}</p>
                <p className="text-sm leading-relaxed text-ink-3">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-32 text-center">
          <SignedOut>
            <Link
              href="/sign-up"
              className="rounded-xl bg-ink-1 px-8 py-4 text-sm font-semibold text-app transition-opacity hover:opacity-85"
            >
              Start free today
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-xl bg-ink-1 px-8 py-4 text-sm font-semibold text-app transition-opacity hover:opacity-85"
            >
              Open workspace
            </Link>
          </SignedIn>
        </div>

        <footer className="mt-24 text-xs text-ink-4">
          © {new Date().getFullYear()} Jaguarnotes
        </footer>
      </main>
    </div>
  );
}
