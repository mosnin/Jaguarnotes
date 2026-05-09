import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";
import { FaqAccordion } from "@/components/landing/faq-accordion";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-white text-ink-1">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-line-1 bg-white/90 px-6 py-3.5 backdrop-blur-md md:px-12">
        <Logo />
        <div className="flex items-center gap-2">
          <SignedOut>
            <Link
              href="/sign-in"
              className="rounded-md px-4 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-raised hover:text-ink-1"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md bg-ink-1 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-85"
            >
              Start for free
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-md bg-ink-1 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-85"
            >
              Open app →
            </Link>
          </SignedIn>
        </div>
      </nav>

      <main className="flex flex-col items-center">

        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <section className="flex w-full max-w-4xl flex-col items-center px-6 pb-20 pt-20 text-center md:pt-28">

          {/* Status badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-line-2 bg-raised px-3 py-1 text-xs font-medium text-ink-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
            </span>
            AI-native · 14 commands · GPT-4o mini
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl text-5xl font-bold leading-[1.08] tracking-[-0.03em] text-ink-1 md:text-6xl lg:text-7xl">
            The note-taking app where{" "}
            <span className="text-ai">AI does the work.</span>
          </h1>

          {/* Sub */}
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-2 md:text-lg">
            Type a thought. Hit <code className="rounded bg-raised px-1.5 py-0.5 text-xs font-semibold text-ink-1">/</code> and choose from 14 AI commands — tables, outlines, research, and more. In under a second.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <SignedOut>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-md bg-ai px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                Start for free
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 16 16" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 rounded-md border border-line-2 px-6 py-3 text-sm font-medium text-ink-2 transition-colors hover:bg-raised hover:text-ink-1"
              >
                Sign in
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-md bg-ai px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                Open workspace →
              </Link>
            </SignedIn>
          </div>
          <p className="mt-3 text-xs text-ink-3">Free account · No credit card · Instant access</p>

          {/* ── Product demo card ── */}
          <div className="relative mt-16 w-full overflow-hidden rounded-xl border border-line-2 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.10)]">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-line-1 bg-raised px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#FC6058" }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#FEC02F" }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#2ACA3E" }} />
              <span className="ml-3 text-[11px] font-medium text-ink-3">Strategy Notes — Jaguarnotes</span>
            </div>

            {/* Content area */}
            <div className="bg-white px-8 py-8 text-left">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-ink-3">Note</p>
              <h3 className="mb-6 text-xl font-bold tracking-tight text-ink-1">Strategy Notes</h3>

              <div className="space-y-4 text-[15px] leading-relaxed text-ink-2">
                <p>Things worth thinking harder about:</p>

                <div className="flex items-start gap-2">
                  <span className="text-ink-1 font-medium">transformer architecture</span>
                  <span className="mt-1 inline-flex items-center gap-1 rounded border border-line-2 bg-raised px-1.5 py-0.5 text-[9px] font-mono text-ink-3 align-top">
                    Tab ↵
                  </span>
                </div>

                {/* AI autocomplete output box */}
                <div className="rounded-lg border border-line-2 bg-raised">
                  <div className="flex items-center gap-2 border-b border-line-1 px-3 py-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ai" />
                    <span className="text-[10px] uppercase tracking-widest text-ink-3">AI thinking…</span>
                  </div>
                  <p className="px-4 py-3 text-sm leading-relaxed text-ink-2">
                    A transformer is a neural network architecture that uses self-attention to process sequences in parallel, enabling models to capture long-range dependencies far more efficiently than recurrent networks.
                    <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-ai align-middle" />
                  </p>
                </div>

                {/* Slash command */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-ai">/table</span>
                  <span className="text-xs text-ink-3">use cases →</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature chips */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {[
              "14 AI commands",
              "Tab autocomplete",
              "Real-time sync",
              "Note linking",
            ].map((label) => (
              <span
                key={label}
                className="rounded-full border border-line-2 bg-white px-3 py-1 text-xs font-medium text-ink-2"
              >
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="w-full border-t border-line-1" />

        {/* ══════════════════════════════════════════
            STATS
        ══════════════════════════════════════════ */}
        <section className="w-full max-w-3xl px-6 py-16">
          <div className="grid grid-cols-2 divide-x divide-y divide-line-1 border border-line-1 sm:grid-cols-4 sm:divide-y-0 rounded-xl overflow-hidden">
            {[
              { value: "14", label: "AI commands" },
              { value: "<1s", label: "avg response" },
              { value: "∞", label: "notes" },
              { value: "100%", label: "keyboard-driven" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center py-8 px-4 text-center bg-white">
                <span className="text-4xl font-bold tracking-tight text-ink-1 md:text-5xl">{s.value}</span>
                <span className="mt-1.5 text-xs text-ink-3">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="w-full border-t border-line-1" />

        {/* ══════════════════════════════════════════
            COMMANDS
        ══════════════════════════════════════════ */}
        <section className="w-full max-w-3xl px-6 py-16">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-ink-3">14 AI commands</p>
          <div className="mt-6 flex flex-wrap justify-center gap-1.5">
            {[
              "/table", "/diagram", "/explain", "/brainstorm",
              "/outline", "/research", "/compress", "/punch",
              "/counter", "/sowhat", "/assume", "/question",
              "/premortem", "/brief",
            ].map((cmd) => (
              <span
                key={cmd}
                className="rounded border border-line-2 bg-raised px-2.5 py-1 font-mono text-xs font-medium text-ink-2 transition-colors hover:border-ai hover:text-ai"
              >
                {cmd}
              </span>
            ))}
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="w-full border-t border-line-1" />

        {/* ══════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════ */}
        <section className="w-full max-w-3xl px-6 py-16">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-ink-3">How it works</p>
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-ink-1">Three keystrokes to brilliant</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "01",
                label: "Slash to create",
                body: "Type / and choose from 14 AI commands. Table, diagram, outline, research — in seconds.",
              },
              {
                step: "02",
                label: "Tab to expand",
                body: "Mid-thought, hit Tab. The AI finishes your sentence with expert-level context from your note.",
              },
              {
                step: "03",
                label: "Built for speed",
                body: "No popups, no modals, no friction. Ideas flow directly onto the page, synced in real time.",
              },
            ].map((f) => (
              <div key={f.label} className="rounded-xl border border-line-2 bg-white p-6">
                <span className="mb-4 block font-mono text-xs font-bold text-ai">{f.step}</span>
                <p className="mb-2 text-sm font-semibold text-ink-1">{f.label}</p>
                <p className="text-sm leading-relaxed text-ink-2">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="w-full border-t border-line-1" />

        {/* ══════════════════════════════════════════
            FEATURES
        ══════════════════════════════════════════ */}
        <section className="w-full max-w-3xl px-6 py-16">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-ink-3">Features</p>
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-ink-1">Everything you need to think better</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                title: "AI Autocomplete",
                desc: "Press Tab anywhere in a note. The AI reads your context and continues your thought with pinpoint accuracy.",
                icon: "⌨️",
              },
              {
                title: "Real-time Sync",
                desc: "Notes save instantly across every device. No manual save. No version conflicts. Always current.",
                icon: "⚡",
              },
              {
                title: "Block Editor",
                desc: "Drag-and-drop blocks, slash commands, and inline formatting — the writing surface you already know.",
                icon: "📝",
              },
              {
                title: "AI Research",
                desc: "/research pulls live web context and synthesises it into a dense, citable 300-word brief.",
                icon: "🔍",
              },
              {
                title: "Note Linking",
                desc: "Link notes together. Backlinks appear automatically. Build a second brain without the overhead.",
                icon: "🔗",
              },
              {
                title: "Tags & Hierarchy",
                desc: "Organise with tags, nest notes inside notes, or let the AI do it for you with /outline.",
                icon: "🗂️",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex gap-4 rounded-xl border border-line-2 bg-white p-5 transition-colors hover:bg-raised"
              >
                <span className="mt-0.5 shrink-0 text-xl leading-none">{f.icon}</span>
                <div>
                  <p className="mb-1 text-sm font-semibold text-ink-1">{f.title}</p>
                  <p className="text-xs leading-relaxed text-ink-2">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="w-full border-t border-line-1" />

        {/* ══════════════════════════════════════════
            SOCIAL PROOF
        ══════════════════════════════════════════ */}
        <section className="w-full max-w-3xl px-6 py-16">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-ink-3">Early users</p>
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-ink-1">What people are saying</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                quote: "I went from blank page to structured outline in under 30 seconds. That's never happened before.",
                name: "Maya K.",
                role: "Founder",
                initials: "MK",
              },
              {
                quote: "The /research command alone is worth it. It's like having a research assistant who never sleeps.",
                name: "Daniel T.",
                role: "Researcher",
                initials: "DT",
              },
              {
                quote: "Tab autocomplete is uncanny. It knows what I'm trying to say before I do.",
                name: "Priya S.",
                role: "Writer",
                initials: "PS",
              },
            ].map((t) => (
              <div key={t.name} className="flex flex-col gap-4 rounded-xl border border-line-2 bg-white p-5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-3.5 w-3.5 fill-amber-400" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-ink-2">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-raised text-xs font-bold text-ink-2">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-1">{t.name}</p>
                    <p className="text-[10px] text-ink-3">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="w-full border-t border-line-1" />

        {/* ══════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════ */}
        <section className="w-full max-w-2xl px-6 py-16">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-ink-3">FAQ</p>
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-ink-1">Common questions</h2>
          <FaqAccordion />
        </section>

        {/* ── Divider ── */}
        <div className="w-full border-t border-line-1" />

        {/* ══════════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════════ */}
        <section className="w-full max-w-2xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink-1 md:text-4xl">
            Start thinking better today.
          </h2>
          <p className="mt-3 text-base text-ink-2">
            Free account. No credit card. 14 AI commands ready the moment you sign up.
          </p>
          <div className="mt-8">
            <SignedOut>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-md bg-ai px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                Create free account
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 16 16" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-md bg-ai px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                Open workspace →
              </Link>
            </SignedIn>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="w-full border-t border-line-1 px-6 py-8 md:px-12">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <Logo size="sm" />
            <div className="flex items-center gap-6 text-xs text-ink-3">
              <Link href="/sign-in" className="transition-colors hover:text-ink-1">Sign in</Link>
              <Link href="/sign-up" className="transition-colors hover:text-ink-1">Sign up</Link>
              <span>© {new Date().getFullYear()} Jaguarnotes</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
