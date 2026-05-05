export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center" style={{ backgroundColor: "#EDF4FF" }}>
      {/* Background grid — very faint blue lines */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      {/* Soft blue glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
        style={{ backgroundColor: "rgba(147, 197, 253, 0.25)" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl neu-raised"
            style={{ backgroundColor: "#EDF4FF" }}
          >
            <span className="text-base font-bold" style={{ color: "#2563EB" }}>J</span>
          </div>
          <span className="text-lg font-semibold tracking-tight" style={{ color: "#1B3652" }}>Jaguarnotes</span>
        </div>

        {children}
      </div>
    </div>
  );
}
