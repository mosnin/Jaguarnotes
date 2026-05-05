import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AnimatedDemo } from "@/components/landing/animated-demo";
import { Logo } from "@/components/ui/logo";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-app">
      {/* Soft blue ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full blur-[160px]"
        style={{ backgroundColor: "rgba(147, 197, 253, 0.3)" }}
      />

      {/* Nav */}
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

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center px-6 pb-32 pt-20 text-center md:pt-28">

        {/* Headline */}
        <h1 className="mx-auto max-w-2xl text-6xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl" style={{ color: "#1B3652" }}>
          Think out loud.
        </h1>
        <p className="mt-4 text-xl font-normal md:text-2xl" style={{ color: "#7B9AB8" }}>
          The AI writes the rest.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex items-center gap-4">
          <SignedOut>
            <Link
              href="/sign-up"
              className="neu-btn rounded-lg px-8 py-3.5 text-sm font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: "#2563EB" }}
            >
              Start for free
            </Link>
            <Link
              href="/sign-in"
              className="text-sm transition-colors hover:text-ink-1"
              style={{ color: "#7B9AB8" }}
            >
              Sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="neu-btn rounded-lg px-8 py-3.5 text-sm font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: "#2563EB" }}
            >
              Open workspace
            </Link>
          </SignedIn>
        </div>

        {/* Live animated demo */}
        <AnimatedDemo />

        {/* Command capabilities strip */}
        <div className="mx-auto mt-16 w-full max-w-3xl">
          <p className="mb-4 text-center text-[10px] uppercase tracking-widest" style={{ color: "#A8C2D8" }}>14 AI commands</p>
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
              <div key={f.label} className="neu-sm rounded-2xl p-5 bg-surface">
                <p className="mb-2 text-sm font-semibold" style={{ color: "#1B3652" }}>{f.label}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#7B9AB8" }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-20 text-center text-xs" style={{ color: "#A8C2D8" }}>
          Built on{" "}
          <span style={{ color: "#7B9AB8" }}>GPT-4o mini</span>
          {" · "}
          <span style={{ color: "#7B9AB8" }}>Convex</span>
          {" · "}
          <span style={{ color: "#7B9AB8" }}>Next.js</span>
        </p>

        {/* Bottom CTA */}
        <div className="mt-32 text-center">
          <SignedOut>
            <Link
              href="/sign-up"
              className="neu-btn rounded-lg px-8 py-4 text-sm font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: "#2563EB" }}
            >
              Start thinking better →
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="neu-btn rounded-lg px-8 py-4 text-sm font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: "#2563EB" }}
            >
              Open workspace →
            </Link>
          </SignedIn>
        </div>

        <footer className="mt-24 text-xs" style={{ color: "#A8C2D8" }}>
          © {new Date().getFullYear()} Jaguarnotes
        </footer>
      </main>
    </div>
  );
}
