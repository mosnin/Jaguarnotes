export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#0a0a0a]">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <span className="text-base font-bold text-white">J</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">Jaguarnotes</span>
        </div>

        {children}
      </div>
    </div>
  );
}
