import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

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

        {/* Editor preview */}
        <div className="relative mx-auto mt-20 w-full max-w-4xl">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-indigo-500/20 to-transparent" />
          <div className="relative overflow-hidden rounded-2xl border border-[#1e1e1e] bg-[#111] shadow-2xl">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-[#1e1e1e] px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-[#2a2a2a]" />
              <div className="h-3 w-3 rounded-full bg-[#2a2a2a]" />
              <div className="h-3 w-3 rounded-full bg-[#2a2a2a]" />
              <div className="ml-3 flex-1 rounded-md bg-[#1a1a1a] px-3 py-1 text-xs text-[#444]">
                jaguarnotes.com/notes/product-strategy
              </div>
            </div>

            {/* Mock editor content */}
            <div className="px-8 py-8 text-left md:px-16 md:py-12">
              <div className="mb-2 text-xs uppercase tracking-widest text-[#333]">Note</div>
              <h2 className="mb-8 text-2xl font-bold text-white md:text-3xl">
                Product Strategy Q3
              </h2>

              <div className="space-y-4 text-[15px] leading-relaxed">
                <p className="text-[#888]">Our core differentiation lies in three vectors:</p>

                <div className="rounded-lg border border-[#1e1e1e] bg-[#0d0d0d] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs text-indigo-400">✦ AI generated</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1e1e1e] text-left text-[#555]">
                        <th className="pb-2 pr-6 font-medium">Vector</th>
                        <th className="pb-2 pr-6 font-medium">Status</th>
                        <th className="pb-2 font-medium">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#888]">
                      <tr className="border-b border-[#1a1a1a]">
                        <td className="py-2 pr-6">AI Autocomplete</td>
                        <td className="py-2 pr-6"><span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">Live</span></td>
                        <td className="py-2">Critical</td>
                      </tr>
                      <tr className="border-b border-[#1a1a1a]">
                        <td className="py-2 pr-6">Real-time Collab</td>
                        <td className="py-2 pr-6"><span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-400">Beta</span></td>
                        <td className="py-2">High</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-6">Agent Sandbox</td>
                        <td className="py-2 pr-6"><span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">Planned</span></td>
                        <td className="py-2">High</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center gap-3 text-[#888]">
                  <span className="text-indigo-400">/</span>
                  <span className="rounded bg-[#1a1a1a] px-2 py-1 font-mono text-xs text-[#555]">diagram GTM motion</span>
                  <span className="animate-pulse text-indigo-400">|</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-32 w-full max-w-5xl">
          <p className="mb-16 text-xs uppercase tracking-widest text-[#333]">
            Built for the way you actually think
          </p>
          <div className="grid gap-px bg-[#1e1e1e] sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "⌥",
                title: "AI Autocomplete",
                desc: "Tab to expand any concept inline. No context switching, no copy-paste.",
              },
              {
                icon: "/",
                title: "Slash Commands",
                desc: "/table, /diagram, /outline — AI generates the content. You just ask.",
              },
              {
                icon: "⚡",
                title: "Real-time Sync",
                desc: "Powered by Convex. Every keystroke synced instantly across all devices.",
              },
              {
                icon: "🤖",
                title: "Agent-powered",
                desc: "Each command runs a focused AI agent via OpenAI Agents SDK in an isolated sandbox.",
              },
              {
                icon: "🔒",
                title: "Isolated Execution",
                desc: "Daytona sandboxes give every agent a clean, secure environment to run in.",
              },
              {
                icon: "📱",
                title: "Works everywhere",
                desc: "PWA-ready. Full desktop. Mobile-native. Your workspace follows you.",
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
