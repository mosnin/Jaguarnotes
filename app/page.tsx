import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AnimatedDemo } from "@/components/landing/animated-demo";
import { Logo } from "@/components/ui/logo";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-app">
      {/* Single, confident glow — not decoration, just depth */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-ai/[0.07] blur-[140px]" />

      {/* Nav */}
      <nav className="relative z-10 flex w-full items-center justify-between px-6 py-5 md:px-12">
        <Logo />

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

        {/* Command capabilities strip */}
        <div className="mx-auto mt-16 w-full max-w-3xl">
          <p className="mb-4 text-center text-[10px] uppercase tracking-widest text-ink-4">14 AI commands</p>
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
                className="group relative flex items-center gap-1.5 rounded-full border border-line-1 bg-surface px-3 py-1.5 text-xs transition-all hover:border-ai/40 hover:bg-ai-dim"
              >
                <span className="font-mono text-ai">{item.cmd}</span>
                <span className="max-w-0 overflow-hidden text-ink-4 transition-all duration-200 group-hover:max-w-[120px]">
                  &nbsp;·&nbsp;{item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Three truths */}
        <div className="mx-auto mt-32 w-full max-w-3xl">
          <div className="grid gap-16 text-left sm:grid-cols-3">
            {[
              {
                label: "Slash to create",
                body: "Type / and choose from 14 AI commands. Table, diagram, outline, research — in seconds.",
              },
              {
                label: "Tab to expand",
                body: "Mid-thought, hit Tab. The AI finishes your sentence with expert-level context.",
              },
              {
                label: "Built for speed",
                body: "No popups, no modals, no friction. Ideas flow directly onto the page.",
              },
            ].map((f) => (
              <div key={f.label}>
                <p className="mb-2 text-sm font-semibold text-ink-1">{f.label}</p>
                <p className="text-sm leading-relaxed text-ink-3">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-20 text-center text-xs text-ink-4">
          Built on{" "}
          <span className="text-ink-3">GPT-4o mini</span>
          {" · "}
          <span className="text-ink-3">Convex</span>
          {" · "}
          <span className="text-ink-3">Next.js</span>
        </p>

        {/* Bottom CTA */}
        <div className="mt-32 text-center">
          <SignedOut>
            <Link
              href="/sign-up"
              className="rounded-xl bg-ink-1 px-8 py-4 text-sm font-semibold text-app transition-opacity hover:opacity-85"
            >
              Start thinking better →
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-xl bg-ink-1 px-8 py-4 text-sm font-semibold text-app transition-opacity hover:opacity-85"
            >
              Open workspace →
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
