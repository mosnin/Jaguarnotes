"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const roles = [
  { id: "founder", label: "Founder", icon: "🚀" },
  { id: "researcher", label: "Researcher", icon: "🔬" },
  { id: "engineer", label: "Engineer", icon: "⚙️" },
  { id: "writer", label: "Writer", icon: "✍️" },
  { id: "designer", label: "Designer", icon: "🎨" },
  { id: "other", label: "Other", icon: "✦" },
];

const useCases = [
  { id: "notes", label: "Personal notes" },
  { id: "research", label: "Research & learning" },
  { id: "projects", label: "Project planning" },
  { id: "writing", label: "Long-form writing" },
  { id: "collab", label: "Team collaboration" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("");
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const firstName = user?.firstName ?? "there";

  function toggleUseCase(id: string) {
    setSelectedUseCases((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  }

  async function finish() {
    setLoading(true);
    // In production: save preferences to Convex
    await new Promise((r) => setTimeout(r, 600));
    router.push("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#0a0a0a] px-4">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Progress */}
        <div className="mb-8 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-500"
              style={{
                background:
                  i <= step
                    ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
                    : "#1e1e1e",
              }}
            />
          ))}
        </div>

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#444]">Welcome</p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                Hey, {firstName}. 👋
              </h1>
              <p className="mt-3 text-[#888]">
                Jaguarnotes is different. Your AI works alongside you — not as a
                button, but as a co-author. Let&apos;s set up your workspace.
              </p>
            </div>

            <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-5 space-y-3 text-sm text-[#888]">
              <div className="flex items-start gap-3">
                <span className="text-indigo-400">⌥</span>
                <div><span className="text-white">AI Autocomplete</span> — Tab to expand any concept inline.</div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-indigo-400">/</span>
                <div><span className="text-white">Slash Commands</span> — /table, /diagram, /outline — AI generates everything.</div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-indigo-400">⚡</span>
                <div><span className="text-white">Real-time</span> — Every note syncs instantly across all your devices.</div>
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_0_50px_rgba(99,102,241,0.5)]"
            >
              Let&apos;s go →
            </button>
          </div>
        )}

        {/* Step 1 — Role */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#444]">Step 1 of 2</p>
              <h1 className="mt-2 text-2xl font-bold text-white">What do you do?</h1>
              <p className="mt-2 text-sm text-[#888]">This helps us tune the AI to your context.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-all ${
                    role === r.id
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-[#1e1e1e] bg-[#111] text-[#888] hover:border-[#333] hover:text-white"
                  }`}
                >
                  <span className="text-xl">{r.icon}</span>
                  <span className="font-medium">{r.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="flex-1 rounded-xl border border-[#1e1e1e] py-3 text-sm text-[#888] transition-colors hover:border-[#333] hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!role}
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 text-sm font-semibold text-white disabled:opacity-30 transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Use cases */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#444]">Step 2 of 2</p>
              <h1 className="mt-2 text-2xl font-bold text-white">How will you use it?</h1>
              <p className="mt-2 text-sm text-[#888]">Pick all that apply.</p>
            </div>

            <div className="flex flex-col gap-2">
              {useCases.map((u) => (
                <button
                  key={u.id}
                  onClick={() => toggleUseCase(u.id)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-sm transition-all ${
                    selectedUseCases.includes(u.id)
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-[#1e1e1e] bg-[#111] text-[#888] hover:border-[#333] hover:text-white"
                  }`}
                >
                  <span className="font-medium">{u.label}</span>
                  {selectedUseCases.includes(u.id) && (
                    <svg className="h-4 w-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border border-[#1e1e1e] py-3 text-sm text-[#888] transition-colors hover:border-[#333] hover:text-white"
              >
                Back
              </button>
              <button
                onClick={finish}
                disabled={selectedUseCases.length === 0 || loading}
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 text-sm font-semibold text-white disabled:opacity-30 transition-all"
              >
                {loading ? "Setting up..." : "Enter workspace →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
