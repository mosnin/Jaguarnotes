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
        <div className="flex items-center gap-4">
          <SignedOut>
            <Link href="/sign-in" className="text-sm transition-colors hover:text-ink-1" style={{ color: "#4A6D8C" }}>
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="neu-btn rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#2563EB" }}
            >
              Get started
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="neu-btn rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#2563EB" }}
            >
              Open app
            </Link>
          </SignedIn>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center px-6 pb-32">

        {/* ══════════════════════════════════════════════════
            HERO — hero-195 style, neumorphism adaptation
        ══════════════════════════════════════════════════ */}
        <section className="flex w-full max-w-5xl flex-col items-center pt-16 text-center md:pt-24">

          {/* Badge */}
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium neu-sm"
            style={{ borderColor: "#C2D5EB", color: "#4A6D8C", backgroundColor: "#F4F8FF" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-ok" />
            AI-native · 14 commands · GPT-4o mini
          </div>

          {/* Headline with typing animation */}
          <h1
            className="mx-auto max-w-3xl text-5xl font-bold leading-[1.07] tracking-tight md:text-6xl lg:text-7xl"
            style={{ color: "#1B3652" }}
          >
            Your thinking,{" "}
            <br className="hidden sm:block" />
            <TypingAnimation
              words={["amplified.", "structured.", "accelerated.", "unleashed.", "elevated."]}
              className="text-[#2563EB]"
            />
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed md:text-xl" style={{ color: "#7B9AB8" }}>
            Type a thought. Hit <kbd className="mx-0.5 rounded px-1.5 py-0.5 text-sm" style={{ background: "#F4F8FF", border: "1px solid #C2D5EB", color: "#4A6D8C" }}>/</kbd> and choose from 14 AI commands.
            The AI does the rest — tables, diagrams, outlines, research — in under a second.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <SignedOut>
              <Link
                href="/sign-up"
                className="neu-btn rounded-xl px-8 py-3.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#2563EB" }}
              >
                Start for free →
              </Link>
              <Link
                href="/sign-in"
                className="rounded-xl border px-8 py-3.5 text-sm font-medium transition-all hover:border-line-3 neu-sm"
                style={{ borderColor: "#C2D5EB", color: "#4A6D8C" }}
              >
                Sign in
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="neu-btn rounded-xl px-8 py-3.5 text-sm font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: "#2563EB" }}
              >
                Open workspace →
              </Link>
            </SignedIn>
          </div>

          {/* Trust line */}
          <p className="mt-5 text-xs" style={{ color: "#A8C2D8" }}>
            Free account · No credit card · Instant access
          </p>

          {/* ── Product screenshot card with BorderBeam ── */}
          <div className="relative mt-14 w-full overflow-hidden rounded-2xl border neu-card" style={{ borderColor: "#D5E4F5", backgroundColor: "#F4F8FF" }}>
            {/* Placeholder — user will provide image */}
            <div
              className="flex h-[340px] w-full items-center justify-center md:h-[480px]"
              style={{ background: "linear-gradient(135deg, #EDF4FF 0%, #F4F8FF 50%, #EDE8FF 100%)" }}
            >
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl neu-sm" style={{ background: "#EDF4FF" }}>
                  <svg className="h-7 w-7" fill="none" stroke="#2563EB" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                </div>
                <p className="text-sm font-medium" style={{ color: "#4A6D8C" }}>Product screenshot coming soon</p>
                <p className="mt-1 text-xs" style={{ color: "#A8C2D8" }}>Images will be placed here</p>
              </div>
            </div>

            {/* Gradient overlay at bottom for depth */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
              style={{ background: "linear-gradient(to top, #EDF4FF, transparent)" }}
            />

            {/* BorderBeam glow — blue palette */}
            <BorderBeam
              size={300}
              duration={12}
              colorFrom="#93C5FD"
              colorTo="#2563EB"
              borderWidth={1.5}
            />
          </div>

          {/* Feature tabs strip */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              { label: "14 AI commands", icon: "⚡" },
              { label: "Tab autocomplete", icon: "⌨️" },
              { label: "Real-time sync", icon: "🔄" },
              { label: "Note linking", icon: "🔗" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs neu-sm"
                style={{ borderColor: "#D5E4F5", backgroundColor: "#F4F8FF", color: "#4A6D8C" }}
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
                <span className="text-3xl font-bold" style={{ color: "#2563EB" }}>{s.value}</span>
                <span className="mt-1 text-xs" style={{ color: "#7B9AB8" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            COMMAND STRIP
        ══════════════════════════════════════════════════ */}
        <section className="mx-auto mt-20 w-full max-w-3xl">
          <p className="mb-4 text-center text-[10px] uppercase tracking-widest" style={{ color: "#A8C2D8" }}>
            14 AI commands
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { cmd: "/table", desc: "Generate tables" },
              { cmd: "/diagram", desc: "Mermaid diagrams" },
              { cmd: "/explain", desc: "Deep explanations" },
              { cmd: "/brainstorm", desc: "Idea generation" },
              { cmd: "/outline", desc: "Document structure" },
              { cmd: "/research", desc: "Web synthesis" },
              { cmd: "/compress", desc: "Distill to essence" },
              { cmd: "/punch", desc: "Sharper writing" },
              { cmd: "/counter", desc: "Steel-man it" },
              { cmd: "/sowhat", desc: "Surface the insight" },
              { cmd: "/assume", desc: "Audit assumptions" },
              { cmd: "/question", desc: "Find blind spots" },
              { cmd: "/premortem", desc: "Anticipate failure" },
              { cmd: "/brief", desc: "Executive brief" },
            ].map((item) => (
              <div
                key={item.cmd}
                className="group relative flex items-center gap-1.5 neu-sm rounded-full border border-line-1 bg-surface px-3 py-1.5 text-xs transition-all hover:border-ai/40 hover:bg-ai-dim cursor-default"
              >
                <span className="font-mono" style={{ color: "#2563EB" }}>{item.cmd}</span>
                <span className="max-w-0 overflow-hidden transition-all duration-200 group-hover:max-w-[120px]" style={{ color: "#A8C2D8" }}>
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
          <p className="mb-2 text-center text-[10px] uppercase tracking-widest" style={{ color: "#A8C2D8" }}>How it works</p>
          <h2 className="mb-12 text-center text-3xl font-bold" style={{ color: "#1B3652" }}>Three keystrokes to brilliant</h2>
          <div className="grid gap-6 text-left sm:grid-cols-3">
            {[
              { step: "01", label: "Slash to create", body: "Type / and choose from 14 AI commands. Table, diagram, outline, research — in seconds." },
              { step: "02", label: "Tab to expand", body: "Mid-thought, hit Tab. The AI finishes your sentence with expert-level context from your note." },
              { step: "03", label: "Built for speed", body: "No popups, no modals, no friction. Ideas flow directly onto the page, synced in real time." },
            ].map((f) => (
              <div key={f.label} className="neu-card rounded-2xl p-5 bg-surface">
                <span className="mb-3 block text-xs font-mono font-semibold" style={{ color: "#2563EB" }}>{f.step}</span>
                <p className="mb-2 text-sm font-semibold" style={{ color: "#1B3652" }}>{f.label}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#7B9AB8" }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FEATURE BREAKDOWN
        ══════════════════════════════════════════════════ */}
        <section className="mx-auto mt-32 w-full max-w-3xl">
          <p className="mb-2 text-center text-[10px] uppercase tracking-widest" style={{ color: "#A8C2D8" }}>Features</p>
          <h2 className="mb-12 text-center text-3xl font-bold" style={{ color: "#1B3652" }}>Everything you need to think better</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "AI Autocomplete", desc: "Press Tab anywhere in a note. The AI reads your context and continues your thought with pinpoint accuracy.", icon: "⌨️" },
              { title: "Real-time Sync", desc: "Notes save instantly across every device. No manual save. No version conflicts. Always current.", icon: "⚡" },
              { title: "Block Editor", desc: "Drag-and-drop blocks, slash commands, and inline formatting — the writing surface you already know.", icon: "📝" },
              { title: "AI Research", desc: "/research pulls live web context and synthesises it into a dense, citable 300-word brief.", icon: "🔍" },
              { title: "Note Linking", desc: "Link notes together. Backlinks appear automatically. Build a second brain without the overhead.", icon: "🔗" },
              { title: "Tags & Hierarchy", desc: "Organise with tags, nest notes inside notes, or let the AI do it for you with /outline.", icon: "🗂️" },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 rounded-2xl p-5 bg-surface neu-sm border border-line-1">
                <span className="mt-0.5 text-2xl">{f.icon}</span>
                <div>
                  <p className="mb-1 text-sm font-semibold" style={{ color: "#1B3652" }}>{f.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#7B9AB8" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SOCIAL PROOF
        ══════════════════════════════════════════════════ */}
        <section className="mx-auto mt-32 w-full max-w-3xl">
          <p className="mb-2 text-center text-[10px] uppercase tracking-widest" style={{ color: "#A8C2D8" }}>Early users</p>
          <h2 className="mb-10 text-center text-3xl font-bold" style={{ color: "#1B3652" }}>What people are saying</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { quote: "I went from blank page to structured outline in under 30 seconds. That's never happened before.", name: "Maya K.", role: "Founder" },
              { quote: "The /research command alone is worth it. It's like having a research assistant who never sleeps.", name: "Daniel T.", role: "Researcher" },
              { quote: "Tab autocomplete is uncanny. It knows what I'm trying to say before I do.", name: "Priya S.", role: "Writer" },
            ].map((t) => (
              <div key={t.name} className="flex flex-col gap-3 rounded-2xl p-5 bg-surface neu-card">
                <p className="text-sm leading-relaxed" style={{ color: "#4A6D8C" }}>&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-auto">
                  <p className="text-xs font-semibold" style={{ color: "#1B3652" }}>{t.name}</p>
                  <p className="text-xs" style={{ color: "#A8C2D8" }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════════════ */}
        <section className="mx-auto mt-32 w-full max-w-2xl">
          <p className="mb-2 text-center text-[10px] uppercase tracking-widest" style={{ color: "#A8C2D8" }}>FAQ</p>
          <h2 className="mb-10 text-center text-3xl font-bold" style={{ color: "#1B3652" }}>Common questions</h2>
          <div className="space-y-3">
            {[
              { q: "Is it really free?", a: "Yes. Create an account and start using all 14 AI commands immediately, no credit card required." },
              { q: "Which AI model powers it?", a: "GPT-4o mini — fast, accurate, and optimized for structured generation tasks like tables, outlines, and diagrams." },
              { q: "Is my data private?", a: "Notes are stored securely in Convex and tied to your account. We do not train on your content." },
              { q: "Can I use it offline?", a: "The editor is accessible offline, but AI commands and real-time sync require a connection." },
              { q: "Does it work on mobile?", a: "Yes. The app is fully responsive with a dedicated mobile bottom nav and touch-friendly editor." },
            ].map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-line-1 bg-surface neu-sm">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold list-none" style={{ color: "#1B3652" }}>
                  {faq.q}
                  <span className="ml-4 shrink-0 text-xs transition-transform group-open:rotate-180" style={{ color: "#A8C2D8" }}>▼</span>
                </summary>
                <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: "#7B9AB8" }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════════════════ */}
        <section className="mt-32 flex flex-col items-center text-center">
          <div className="relative overflow-hidden rounded-3xl px-10 py-12 text-center neu-card bg-surface" style={{ maxWidth: 520 }}>
            <h2 className="text-3xl font-bold" style={{ color: "#1B3652" }}>Start thinking better today</h2>
            <p className="mt-3 text-sm" style={{ color: "#7B9AB8" }}>
              Free account. No credit card. 14 AI commands ready the moment you sign up.
            </p>
            <div className="mt-6">
              <SignedOut>
                <Link
                  href="/sign-up"
                  className="neu-btn inline-block rounded-xl px-8 py-4 text-sm font-semibold text-white hover:opacity-90"
                  style={{ backgroundColor: "#2563EB" }}
                >
                  Create free account →
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="neu-btn inline-block rounded-xl px-8 py-4 text-sm font-semibold text-white hover:opacity-90"
                  style={{ backgroundColor: "#2563EB" }}
                >
                  Open workspace →
                </Link>
              </SignedIn>
            </div>
            <BorderBeam size={250} duration={10} colorFrom="#93C5FD" colorTo="#2563EB" borderWidth={1} />
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="mt-20 w-full max-w-3xl border-t border-line-1 pt-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Logo size="sm" />
            <div className="flex items-center gap-6 text-xs" style={{ color: "#A8C2D8" }}>
              <Link href="/sign-in" className="transition-colors hover:text-ink-2">Sign in</Link>
              <Link href="/sign-up" className="transition-colors hover:text-ink-2">Sign up</Link>
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
