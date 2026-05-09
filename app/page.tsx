import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";
import { BorderBeam } from "@/components/ui/border-beam";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { FaqAccordion } from "@/components/landing/faq-accordion";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-app">
      {/* ── Nav ── */}
      <nav className="relative z-10 flex w-full items-center justify-between px-6 py-5 md:px-12">
        <Logo />
        <div className="flex items-center gap-3">
          <SignedOut>
            <Link
              href="/sign-in"
              className="text-sm font-medium transition-colors hover:text-ink-1"
              style={{ color: "#4A6D8C" }}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="neu-btn rounded-xl px-4 py-2 text-sm font-semibold text-white active:scale-95"
              style={{ backgroundColor: "#2563EB" }}
            >
              Get started
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="neu-btn rounded-xl px-4 py-2 text-sm font-semibold text-white active:scale-95"
              style={{ backgroundColor: "#2563EB" }}
            >
              Open app
            </Link>
          </SignedIn>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center px-6 pb-32">

        {/* ══════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════ */}
        <section className="flex w-full max-w-5xl flex-col items-center pt-16 text-center md:pt-24 py-20 md:py-28">

          {/* Badge — polished with arrow at end */}
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold neu-xs"
            style={{
              borderColor: "rgba(37,99,235,0.3)",
              color: "#2563EB",
              backgroundColor: "rgba(37,99,235,0.06)",
            }}
          >
            {/* Ping-pulse animated green dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ok opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: "#16A34A" }} />
            </span>
            AI-native · 14 commands · GPT-4o mini
            <span className="ml-0.5">→</span>
          </div>

          {/* Headline */}
          <h1
            className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ color: "#1B3652", letterSpacing: "-0.02em" }}
          >
            Your{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              AI-native
            </span>{" "}
            workspace,{" "}
            <br className="hidden sm:block" />
            <TypingAnimation
              words={["amplified.", "structured.", "accelerated.", "unleashed.", "elevated."]}
              className="text-[#2563EB]"
            />
          </h1>

          {/* Sub-headline — wider, better line-height */}
          <p
            className="mt-6 max-w-2xl text-base leading-loose md:text-lg"
            style={{ color: "#4A6D8C" }}
          >
            Type a thought. Hit{" "}
            <kbd className="mx-0.5 rounded-md px-1.5 py-0.5 text-xs neu-xs" style={{ background: "#F4F8FF", border: "1px solid #C2D5EB", color: "#2563EB", fontWeight: 600 }}>/</kbd>
            {" "}and choose from 14 AI commands.
            Tables, diagrams, outlines, research — in under a second.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <SignedOut>
              {/* Primary CTA — arrow slides right on hover */}
              <Link
                href="/sign-up"
                className="group neu-btn rounded-xl px-8 py-3.5 text-sm font-semibold text-white active:scale-95 transition-all inline-flex items-center gap-2"
                style={{ backgroundColor: "#2563EB" }}
              >
                Start for free
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
              {/* Ghost / secondary CTA */}
              <Link
                href="/sign-in"
                className="group rounded-xl border border-line-2 px-8 py-3.5 text-sm font-medium transition-all hover:border-line-3 hover:text-ink-1 neu-sm active:scale-95 inline-flex items-center gap-2"
                style={{ color: "#4A6D8C" }}
              >
                Sign in
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="group neu-btn rounded-xl px-8 py-3.5 text-sm font-semibold text-white active:scale-95 transition-all inline-flex items-center gap-2"
                style={{ backgroundColor: "#2563EB" }}
              >
                Open workspace
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </SignedIn>
          </div>

          {/* Trust line */}
          <p className="mt-4 text-xs" style={{ color: "#A8C2D8" }}>
            Free account · No credit card · Instant access
          </p>

          {/* ── Product card with BorderBeam + shimmer top edge ── */}
          <div
            className="relative mt-14 w-full overflow-hidden rounded-3xl neu-lg"
            style={{ borderColor: "#D5E4F5" }}
          >
            {/* Animated shimmer on top edge */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.4), transparent)",
                animation: "shimmer 2.5s ease-in-out infinite",
                zIndex: 10,
              }}
            />

            {/* Subtle grid pattern fill */}
            <div
              className="flex h-[320px] w-full items-center justify-center md:h-[460px]"
              style={{
                background: "linear-gradient(160deg, #EDF4FF 0%, #F0F5FF 40%, #EDE8FF 100%)",
                backgroundImage: `
                  linear-gradient(160deg, #EDF4FF 0%, #F0F5FF 40%, #EDE8FF 100%),
                  radial-gradient(circle at 20% 50%, rgba(37,99,235,0.04) 0%, transparent 60%),
                  radial-gradient(circle at 80% 20%, rgba(139,124,246,0.04) 0%, transparent 50%)
                `,
              }}
            >
              {/* Subtle grid overlay */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#C2D5EB" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Animated note / AI demo content */}
              <div className="relative z-10 mx-auto w-full max-w-sm px-6">
                {/* Window chrome strip */}
                <div
                  className="rounded-t-xl border border-b-0 px-4 py-2.5 flex items-center gap-2"
                  style={{ background: "#F4F8FF", borderColor: "#D5E4F5" }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: "#ff5f57" }} />
                  <span className="h-2 w-2 rounded-full" style={{ background: "#febc2e" }} />
                  <span className="h-2 w-2 rounded-full" style={{ background: "#28c840" }} />
                  <span className="ml-2 text-[10px] font-medium" style={{ color: "#A8C2D8" }}>
                    Strategy Notes
                  </span>
                </div>
                {/* Note body */}
                <div
                  className="rounded-b-xl border px-5 py-4 space-y-3"
                  style={{ background: "#F4F8FF", borderColor: "#D5E4F5" }}
                >
                  {/* Line 1 — static heading */}
                  <p className="text-sm font-bold" style={{ color: "#1B3652" }}>
                    AI agent harness
                  </p>
                  {/* Line 2 — AI-generated text block */}
                  <p className="text-xs leading-relaxed" style={{ color: "#4A6D8C" }}>
                    A runtime that orchestrates one or more AI agents — routing tasks, managing tool access, and streaming results back into the application surface.
                  </p>
                  {/* Line 3 — slash command hint + blinking cursor */}
                  <div
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2"
                    style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)" }}
                  >
                    <span className="font-mono text-xs font-semibold" style={{ color: "#2563EB" }}>
                      /table
                    </span>
                    <span className="text-xs" style={{ color: "#7B9AB8" }}>use cases →</span>
                    {/* Blinking cursor */}
                    <span
                      className="ml-auto inline-block h-3 w-px"
                      style={{
                        background: "#2563EB",
                        animation: "pulse 1s cubic-bezier(0.4,0,0.6,1) infinite",
                      }}
                    />
                  </div>
                  {/* AI status badge */}
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#2563EB" }} />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "#2563EB" }} />
                    </span>
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: "#7B9AB8" }}>
                      AI generating
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
              style={{ background: "linear-gradient(to top, #EDF4FF, transparent)" }}
            />

            <BorderBeam size={320} duration={10} colorFrom="#93C5FD" colorTo="#2563EB" borderWidth={1.5} />
          </div>

          {/* Feature chips — with neumorphic box-shadow */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {[
              { label: "14 AI commands", icon: "⚡", color: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", text: "#D97706" },
              { label: "Tab autocomplete", icon: "⌨️", color: "rgba(37,99,235,0.06)", border: "rgba(37,99,235,0.2)", text: "#2563EB" },
              { label: "Real-time sync", icon: "🔄", color: "rgba(22,163,74,0.07)", border: "rgba(22,163,74,0.25)", text: "#16A34A" },
              { label: "Note linking", icon: "🔗", color: "rgba(139,124,246,0.08)", border: "rgba(139,124,246,0.3)", text: "#7C3AED" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150 hover:scale-[1.02]"
                style={{
                  borderColor: f.border,
                  backgroundColor: f.color,
                  color: f.text,
                  boxShadow: "1px 1px 3px #C5D5E8, -1px -1px 3px #FFFFFF",
                }}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section divider: hero → stats */}
        <div className="mx-auto max-w-2xl px-6" style={{ height: "1px", background: "linear-gradient(90deg, transparent, #C5D5E8, transparent)" }} />

        {/* ══════════════════════════════════════════════════
            STATS BAND
        ══════════════════════════════════════════════════ */}
        <section className="mx-auto w-full max-w-3xl py-20 md:py-28">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: "14", label: "AI commands" },
              { value: "<1s", label: "avg response" },
              { value: "∞", label: "notes" },
              { value: "100%", label: "keyboard-driven" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center rounded-2xl p-5 text-center neu-card bg-surface">
                <span
                  className="text-4xl font-extrabold md:text-5xl"
                  style={{
                    background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "-0.02em",
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {s.value}
                </span>
                <span className="mt-1.5 text-xs font-medium" style={{ color: "#7B9AB8" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section divider: stats → command strip */}
        <div className="mx-auto max-w-2xl px-6" style={{ height: "1px", background: "linear-gradient(90deg, transparent, #C5D5E8, transparent)" }} />

        {/* ══════════════════════════════════════════════════
            COMMAND STRIP
        ══════════════════════════════════════════════════ */}
        <section className="mx-auto w-full max-w-3xl py-20 md:py-28">
          <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#A8C2D8" }}>
            14 AI commands
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { cmd: "/table",     desc: "Generate tables" },
              { cmd: "/diagram",   desc: "Mermaid diagrams" },
              { cmd: "/explain",   desc: "Deep explanations" },
              { cmd: "/brainstorm",desc: "Idea generation" },
              { cmd: "/outline",   desc: "Document structure" },
              { cmd: "/research",  desc: "Web synthesis" },
              { cmd: "/compress",  desc: "Distill to essence" },
              { cmd: "/punch",     desc: "Sharper writing" },
              { cmd: "/counter",   desc: "Steel-man it" },
              { cmd: "/sowhat",    desc: "Surface the insight" },
              { cmd: "/assume",    desc: "Audit assumptions" },
              { cmd: "/question",  desc: "Find blind spots" },
              { cmd: "/premortem", desc: "Anticipate failure" },
              { cmd: "/brief",     desc: "Executive brief" },
            ].map((item) => (
              <div
                key={item.cmd}
                className="group relative flex cursor-default items-center gap-1.5 rounded-full border border-line-1 bg-surface px-3 py-1.5 text-xs transition-all duration-150 hover:border-ai/40 hover:bg-ai-hint neu-xs"
              >
                <span className="font-mono font-semibold" style={{ color: "#2563EB" }}>{item.cmd}</span>
                <span
                  className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-200 group-hover:max-w-[120px]"
                  style={{ color: "#7B9AB8" }}
                >
                  &nbsp;·&nbsp;{item.desc}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Section divider: command strip → how it works */}
        <div className="mx-auto max-w-2xl px-6" style={{ height: "1px", background: "linear-gradient(90deg, transparent, #C5D5E8, transparent)" }} />

        {/* ══════════════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════════════ */}
        <section className="mx-auto w-full max-w-3xl py-20 md:py-28">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#A8C2D8" }}>How it works</p>
          <h2 className="mb-12 text-center text-3xl font-extrabold" style={{ color: "#1B3652", letterSpacing: "-0.02em" }}>
            Three keystrokes to brilliant
          </h2>
          <div className="grid gap-5 text-left sm:grid-cols-3">
            {[
              { step: "01", label: "Slash to create", body: "Type / and choose from 14 AI commands. Table, diagram, outline, research — in seconds." },
              { step: "02", label: "Tab to expand",   body: "Mid-thought, hit Tab. The AI finishes your sentence with expert-level context from your note." },
              { step: "03", label: "Built for speed", body: "No popups, no modals, no friction. Ideas flow directly onto the page, synced in real time." },
            ].map((f) => (
              <div key={f.label} className="neu-card rounded-2xl p-6 bg-surface">
                <span
                  className="mb-4 block text-xs font-bold font-mono"
                  style={{ color: "#2563EB", letterSpacing: "0.06em" }}
                >
                  {f.step}
                </span>
                <p className="mb-2 text-sm font-bold" style={{ color: "#1B3652" }}>{f.label}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#4A6D8C" }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section divider: how it works → features */}
        <div className="mx-auto max-w-2xl px-6" style={{ height: "1px", background: "linear-gradient(90deg, transparent, #C5D5E8, transparent)" }} />

        {/* ══════════════════════════════════════════════════
            FEATURE BREAKDOWN
        ══════════════════════════════════════════════════ */}
        <section className="mx-auto w-full max-w-3xl py-20 md:py-28">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#A8C2D8" }}>Features</p>
          <h2 className="mb-12 text-center text-3xl font-extrabold" style={{ color: "#1B3652", letterSpacing: "-0.02em" }}>
            Everything you need to think better
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "AI Autocomplete",  desc: "Press Tab anywhere in a note. The AI reads your context and continues your thought with pinpoint accuracy.", icon: "⌨️" },
              { title: "Real-time Sync",   desc: "Notes save instantly across every device. No manual save. No version conflicts. Always current.", icon: "⚡" },
              { title: "Block Editor",     desc: "Drag-and-drop blocks, slash commands, and inline formatting — the writing surface you already know.", icon: "📝" },
              { title: "AI Research",      desc: "/research pulls live web context and synthesises it into a dense, citable 300-word brief.", icon: "🔍" },
              { title: "Note Linking",     desc: "Link notes together. Backlinks appear automatically. Build a second brain without the overhead.", icon: "🔗" },
              { title: "Tags & Hierarchy", desc: "Organise with tags, nest notes inside notes, or let the AI do it for you with /outline.", icon: "🗂️" },
            ].map((f) => (
              <div
                key={f.title}
                className="flex gap-4 rounded-2xl p-5 bg-surface neu-raised border border-line-1 transition-all duration-150 hover:scale-[1.02] hover:shadow-md hover:border-[#C5D5E8] hover:neu-card"
              >
                <span className="mt-0.5 text-2xl leading-none">{f.icon}</span>
                <div>
                  <p className="mb-1.5 text-sm font-bold" style={{ color: "#1B3652" }}>{f.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#4A6D8C" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section divider: features → testimonials */}
        <div className="mx-auto max-w-2xl px-6" style={{ height: "1px", background: "linear-gradient(90deg, transparent, #C5D5E8, transparent)" }} />

        {/* ══════════════════════════════════════════════════
            SOCIAL PROOF
        ══════════════════════════════════════════════════ */}
        <section className="mx-auto w-full max-w-3xl py-20 md:py-28">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#A8C2D8" }}>Early users</p>
          <h2 className="mb-10 text-center text-3xl font-extrabold" style={{ color: "#1B3652", letterSpacing: "-0.02em" }}>
            What people are saying
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { quote: "I went from blank page to structured outline in under 30 seconds. That's never happened before.", name: "Maya K.", role: "Founder", initials: "MK", color: "#EDE8FF", text: "#7C3AED" },
              { quote: "The /research command alone is worth it. It's like having a research assistant who never sleeps.", name: "Daniel T.", role: "Researcher", initials: "DT", color: "#DCF0FF", text: "#2563EB" },
              { quote: "Tab autocomplete is uncanny. It knows what I'm trying to say before I do.", name: "Priya S.", role: "Writer", initials: "PS", color: "#E3F5E1", text: "#16A34A" },
            ].map((t) => (
              <div
                key={t.name}
                className="neu-card flex flex-col gap-4 rounded-2xl p-5 bg-surface transition-colors duration-200 hover:shadow-md"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="#F59E0B">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#2D4A63" }}>&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-auto flex items-center gap-3">
                  {/* Avatar with initials — slightly larger */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: t.color, color: t.text }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold" style={{ color: "#1B3652" }}>{t.name}</p>
                      {/* Verified badge */}
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="#2563EB">
                        <path d="M9 12l2 2 4-4M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <p className="text-[10px]" style={{ color: "#A8C2D8" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section divider: testimonials → FAQ */}
        <div className="mx-auto max-w-2xl px-6" style={{ height: "1px", background: "linear-gradient(90deg, transparent, #C5D5E8, transparent)" }} />

        {/* ══════════════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════════════ */}
        <section className="mx-auto w-full max-w-2xl py-20 md:py-28">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#A8C2D8" }}>FAQ</p>
          <h2 className="mb-10 text-center text-3xl font-extrabold" style={{ color: "#1B3652", letterSpacing: "-0.02em" }}>
            Common questions
          </h2>
          <FaqAccordion />
        </section>

        {/* Section divider: FAQ → CTA */}
        <div className="mx-auto max-w-2xl px-6" style={{ height: "1px", background: "linear-gradient(90deg, transparent, #C5D5E8, transparent)" }} />

        {/* ══════════════════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════════════════ */}
        <section className="mt-8 flex w-full max-w-2xl flex-col items-center text-center py-20 md:py-28">
          <div
            className="relative w-full overflow-hidden rounded-3xl neu-lg bg-surface p-12 text-center"
          >
            {/* Subtle blue gradient spot */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.10) 0%, transparent 70%)" }}
            />
            {/* Blue glow blob behind CTA */}
            <div
              style={{
                position: "absolute",
                width: "400px",
                height: "300px",
                background: "radial-gradient(circle, rgba(37,99,235,0.08), transparent)",
                borderRadius: "50%",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            />
            <h2 className="relative text-3xl font-extrabold" style={{ color: "#1B3652", letterSpacing: "-0.02em" }}>
              Start thinking better today
            </h2>
            <p className="relative mt-3 text-sm leading-relaxed" style={{ color: "#4A6D8C" }}>
              Free account. No credit card. 14 AI commands ready the moment you sign up.
            </p>
            <div className="relative mt-7">
              <SignedOut>
                <Link
                  href="/sign-up"
                  className="group neu-btn inline-flex items-center gap-2 rounded-xl px-10 py-4 text-sm font-semibold text-white active:scale-95 transition-all"
                  style={{ backgroundColor: "#2563EB" }}
                >
                  Create free account
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="group neu-btn inline-flex items-center gap-2 rounded-xl px-10 py-4 text-sm font-semibold text-white active:scale-95 transition-all"
                  style={{ backgroundColor: "#2563EB" }}
                >
                  Open workspace
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </Link>
              </SignedIn>
            </div>
            <BorderBeam size={280} duration={8} colorFrom="#93C5FD" colorTo="#2563EB" borderWidth={1.5} />
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="w-full max-w-5xl border-t border-line-1 py-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Logo size="sm" />
            <div className="flex items-center gap-6 text-xs font-medium" style={{ color: "#7B9AB8" }}>
              <Link href="/sign-in" className="transition-colors hover:text-ink-1">Sign in</Link>
              <Link href="/sign-up" className="transition-colors hover:text-ink-1">Sign up</Link>
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center justify-between gap-2 text-xs sm:flex-row" style={{ color: "#A8C2D8" }}>
            <span>© {new Date().getFullYear()} Jaguarnotes. All rights reserved.</span>
            <div className="flex gap-6">
              {["Features", "Sign in", "Privacy"].map((label) => (
                <Link key={label} href="#" className="text-xs transition-colors hover:text-ink-1" style={{ color: "#7B9AB8" }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center justify-center gap-1 text-xs sm:flex-row">
            <p style={{ color: "#A8C2D8" }}>
              Built on{" "}
              <span style={{ color: "#7B9AB8" }}>GPT-4o mini</span>
              {" · "}
              <span style={{ color: "#7B9AB8" }}>Convex</span>
              {" · "}
              <span style={{ color: "#7B9AB8" }}>Next.js</span>
            </p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-ink-4">© 2025 Jaguarnotes. Built for thinkers.</p>
          </div>
        </footer>
      </main>

      {/* Shimmer keyframe — injected globally via style tag */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
