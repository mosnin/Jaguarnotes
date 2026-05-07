import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";
import { BorderBeam } from "@/components/ui/border-beam";
import { TypingAnimation } from "@/components/ui/typing-animation";

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
        <section className="flex w-full max-w-5xl flex-col items-center pt-16 text-center md:pt-24">

          {/* Badge — blue tinted with blue border */}
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold neu-xs"
            style={{
              borderColor: "rgba(37,99,235,0.3)",
              color: "#2563EB",
              backgroundColor: "rgba(37,99,235,0.06)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#16A34A" }} />
            AI-native · 14 commands · GPT-4o mini
          </div>

          {/* Headline */}
          <h1
            className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ color: "#1B3652", letterSpacing: "-0.02em" }}
          >
            Your thinking,{" "}
            <br className="hidden sm:block" />
            <TypingAnimation
              words={["amplified.", "structured.", "accelerated.", "unleashed.", "elevated."]}
              className="text-[#2563EB]"
            />
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed md:text-lg" style={{ color: "#4A6D8C" }}>
            Type a thought. Hit{" "}
            <kbd className="mx-0.5 rounded-md px-1.5 py-0.5 text-xs neu-xs" style={{ background: "#F4F8FF", border: "1px solid #C2D5EB", color: "#2563EB", fontWeight: 600 }}>/</kbd>
            {" "}and choose from 14 AI commands.
            Tables, diagrams, outlines, research — in under a second.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <SignedOut>
              <Link
                href="/sign-up"
                className="neu-btn rounded-xl px-8 py-3.5 text-sm font-semibold text-white active:scale-95 transition-all"
                style={{ backgroundColor: "#2563EB" }}
              >
                Start for free →
              </Link>
              <Link
                href="/sign-in"
                className="rounded-xl border px-8 py-3.5 text-sm font-medium transition-all hover:border-ai/50 hover:text-ink-1 neu-sm active:scale-95"
                style={{ borderColor: "#C2D5EB", color: "#4A6D8C" }}
              >
                Sign in
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="neu-btn rounded-xl px-8 py-3.5 text-sm font-semibold text-white active:scale-95"
                style={{ backgroundColor: "#2563EB" }}
              >
                Open workspace →
              </Link>
            </SignedIn>
          </div>

          {/* Trust line */}
          <p className="mt-4 text-xs" style={{ color: "#A8C2D8" }}>
            Free account · No credit card · Instant access
          </p>

          {/* ── Product card with BorderBeam ── */}
          <div
            className="relative mt-14 w-full overflow-hidden rounded-3xl neu-lg"
            style={{ borderColor: "#D5E4F5" }}
          >
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

              <div className="relative z-10 text-center">
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl neu-raised"
                  style={{ background: "#EDF4FF" }}
                >
                  <svg className="h-8 w-8" fill="none" stroke="#2563EB" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold" style={{ color: "#4A6D8C" }}>Product screenshot coming soon</p>
                <p className="mt-1 text-xs" style={{ color: "#A8C2D8" }}>Images will be placed here</p>
              </div>
            </div>

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
              style={{ background: "linear-gradient(to top, #EDF4FF, transparent)" }}
            />

            <BorderBeam size={320} duration={10} colorFrom="#93C5FD" colorTo="#2563EB" borderWidth={1.5} />
          </div>

          {/* Feature chips — visually distinct from badge */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {[
              { label: "14 AI commands", icon: "⚡", color: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", text: "#D97706" },
              { label: "Tab autocomplete", icon: "⌨️", color: "rgba(37,99,235,0.06)", border: "rgba(37,99,235,0.2)", text: "#2563EB" },
              { label: "Real-time sync", icon: "🔄", color: "rgba(22,163,74,0.07)", border: "rgba(22,163,74,0.25)", text: "#16A34A" },
              { label: "Note linking", icon: "🔗", color: "rgba(139,124,246,0.08)", border: "rgba(139,124,246,0.3)", text: "#7C3AED" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium"
                style={{ borderColor: f.border, backgroundColor: f.color, color: f.text }}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            STATS BAND
        ══════════════════════════════════════════════════ */}
        <section className="mx-auto mt-24 w-full max-w-3xl">
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
                  style={{ color: "#2563EB", letterSpacing: "-0.02em" }}
                >
                  {s.value}
                </span>
                <span className="mt-1.5 text-xs font-medium" style={{ color: "#7B9AB8" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            COMMAND STRIP
        ══════════════════════════════════════════════════ */}
        <section className="mx-auto mt-20 w-full max-w-3xl">
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

        {/* ══════════════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════════════ */}
        <section className="mx-auto mt-32 w-full max-w-3xl">
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

        {/* ══════════════════════════════════════════════════
            FEATURE BREAKDOWN
        ══════════════════════════════════════════════════ */}
        <section className="mx-auto mt-32 w-full max-w-3xl">
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
              <div key={f.title} className="flex gap-4 rounded-2xl p-5 bg-surface neu-raised border border-line-1 transition-all hover:neu-card">
                <span className="mt-0.5 text-2xl leading-none">{f.icon}</span>
                <div>
                  <p className="mb-1.5 text-sm font-bold" style={{ color: "#1B3652" }}>{f.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#4A6D8C" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SOCIAL PROOF
        ══════════════════════════════════════════════════ */}
        <section className="mx-auto mt-32 w-full max-w-3xl">
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
              <div key={t.name} className="flex flex-col gap-4 rounded-2xl p-5 bg-surface neu-card">
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
                  {/* Avatar with initials */}
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
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

        {/* ══════════════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════════════ */}
        <section className="mx-auto mt-32 w-full max-w-2xl">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#A8C2D8" }}>FAQ</p>
          <h2 className="mb-10 text-center text-3xl font-extrabold" style={{ color: "#1B3652", letterSpacing: "-0.02em" }}>
            Common questions
          </h2>
          <div className="space-y-2">
            {[
              { q: "Is it really free?",             a: "Yes. Create an account and start using all 14 AI commands immediately, no credit card required." },
              { q: "Which AI model powers it?",      a: "GPT-4o mini — fast, accurate, and optimized for structured generation tasks like tables, outlines, and diagrams." },
              { q: "Is my data private?",            a: "Notes are stored securely in Convex and tied to your account. We do not train on your content." },
              { q: "Can I use it offline?",          a: "The editor is accessible offline, but AI commands and real-time sync require a connection." },
              { q: "Does it work on mobile?",        a: "Yes. The app is fully responsive with a dedicated mobile bottom nav and touch-friendly editor." },
            ].map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-line-1 bg-surface neu-sm overflow-hidden">
                <summary
                  className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold select-none"
                  style={{ color: "#1B3652" }}
                >
                  {faq.q}
                  <svg
                    className="ml-4 h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    style={{ color: "#7B9AB8" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: "#4A6D8C" }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════════════════ */}
        <section className="mt-32 flex w-full max-w-2xl flex-col items-center text-center">
          <div
            className="relative w-full overflow-hidden rounded-3xl px-10 py-14 text-center neu-lg bg-surface"
          >
            {/* Subtle blue gradient spot */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.10) 0%, transparent 70%)" }}
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
                  className="neu-btn inline-block rounded-xl px-10 py-4 text-sm font-semibold text-white active:scale-95 transition-all"
                  style={{ backgroundColor: "#2563EB" }}
                >
                  Create free account →
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="neu-btn inline-block rounded-xl px-10 py-4 text-sm font-semibold text-white active:scale-95 transition-all"
                  style={{ backgroundColor: "#2563EB" }}
                >
                  Open workspace →
                </Link>
              </SignedIn>
            </div>
            <BorderBeam size={280} duration={8} colorFrom="#93C5FD" colorTo="#2563EB" borderWidth={1.5} />
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="mt-20 w-full max-w-3xl border-t border-line-1 pt-10">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Logo size="sm" />
            <div className="flex items-center gap-6 text-xs font-medium" style={{ color: "#7B9AB8" }}>
              <Link href="/sign-in" className="transition-colors hover:text-ink-1">Sign in</Link>
              <Link href="/sign-up" className="transition-colors hover:text-ink-1">Sign up</Link>
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center justify-between gap-2 text-xs sm:flex-row" style={{ color: "#A8C2D8" }}>
            <p>© {new Date().getFullYear()} Jaguarnotes. All rights reserved.</p>
            <p>
              Built on{" "}
              <span style={{ color: "#7B9AB8" }}>GPT-4o mini</span>
              {" · "}
              <span style={{ color: "#7B9AB8" }}>Convex</span>
              {" · "}
              <span style={{ color: "#7B9AB8" }}>Next.js</span>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
