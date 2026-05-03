import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AnimatedDemo } from "@/components/landing/animated-demo";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a]">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Glow orb */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />

      {/* Nav */}
      <nav className="relative z-10 flex w-full items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
            <span className="text-sm font-bold text-white">J</span>
          </div>
          <span className="text-base font-semibold tracking-tight text-white">Jaguarnotes</span>
        </div>

        <div className="flex items-center gap-3">
          <SignedOut>
            <Link
              href="/sign-in"
              className="text-sm text-[#888] transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              Get started
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              Open app
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center px-6 pb-32 pt-24 text-center md:pt-32">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1e1e1e] bg-[#111] px-4 py-1.5 text-xs text-[#888]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#4ade80]" />
          AI-native · Real-time · Agentic
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.08] tracking-tight text-white md:text-7xl lg:text-8xl">
          Notes that{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            think
          </span>{" "}
          with you.
        </h1>

        {/* Sub */}
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#888] md:text-xl">
          Jaguarnotes is the workspace where AI does the writing. You direct.
          Type a concept, trigger a command — your ideas expand instantly.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <SignedOut>
            <Link
              href="/sign-up"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_40px_rgba(99,102,241,0.35)] transition-all hover:shadow-[0_0_60px_rgba(99,102,241,0.5)]"
            >
              Start for free
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-xl border border-[#1e1e1e] bg-[#111] px-7 py-3.5 text-sm font-medium text-[#888] transition-colors hover:border-[#333] hover:text-white"
            >
              Sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_40px_rgba(99,102,241,0.35)] transition-all hover:shadow-[0_0_60px_rgba(99,102,241,0.5)]"
            >
              Open your workspace
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </SignedIn>
        </div>

        {/* Live animated demo — shows the product working, not a screenshot */}
        <AnimatedDemo />

        {/* Features */}
        <div className="mx-auto mt-32 w-full max-w-5xl">
          <p className="mb-16 text-xs uppercase tracking-widest text-[#333]">
            Built for the way you actually think
          </p>
          <div className="grid gap-px bg-[#1e1e1e] sm:grid-cols-3">
            {[
              {
                icon: "⌥",
                title: "Tab to think",
                desc: "Expand any concept inline. No context switch. No copy-paste. Just Tab.",
              },
              {
                icon: "/",
                title: "13 AI commands",
                desc: "Generate, compress, punch, counter, brief — the AI does the work. You direct.",
              },
              {
                icon: "⚡",
                title: "Real-time, everywhere",
                desc: "Convex keeps every note live across all devices. PWA-ready. Always in sync.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-[#0a0a0a] p-8 transition-colors hover:bg-[#0f0f0f]">
                <div className="mb-4 text-2xl">{f.icon}</div>
                <h3 className="mb-2 text-sm font-semibold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[#555]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mx-auto mt-32 max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Think it. Direct it.{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Ship it.
            </span>
          </h2>
          <p className="mt-4 text-[#555]">
            Join the workspace built for people who think for a living.
          </p>
          <div className="mt-8">
            <SignedOut>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 text-sm font-semibold text-white shadow-[0_0_40px_rgba(99,102,241,0.35)] transition-all hover:shadow-[0_0_60px_rgba(99,102,241,0.5)]"
              >
                Start free today
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 text-sm font-semibold text-white shadow-[0_0_40px_rgba(99,102,241,0.35)] transition-all hover:shadow-[0_0_60px_rgba(99,102,241,0.5)]"
              >
                Open workspace
              </Link>
            </SignedIn>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 w-full border-t border-[#111] pt-8 text-center text-xs text-[#333]">
          © {new Date().getFullYear()} Jaguarnotes. Built for people who think for a living.
        </footer>
      </main>
    </div>
  );
}
