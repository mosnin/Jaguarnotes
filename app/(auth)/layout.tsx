export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center" style={{ backgroundColor: "#EDF4FF" }}>
      {/* Animated gradient orbs */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-10%", right: "10%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.06), transparent 70%)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "5%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.05), transparent 70%)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", top: "40%", left: "30%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.04), transparent 70%)", filter: "blur(30px)" }} />
      </div>

      {/* Subtle dot grid overlay */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.09) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Main content */}
      <div className="relative flex flex-col items-center gap-8" style={{ position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              backgroundColor: "#EDF4FF",
              boxShadow: "3px 3px 8px #C5D5E8, -3px -3px 8px #FFFFFF",
              borderRadius: "14px",
            }}
          >
            <span className="text-base font-bold" style={{ color: "#2563EB" }}>J</span>
          </div>
          <span className="text-lg font-semibold tracking-tight" style={{ color: "#1B3652" }}>Jaguarnotes</span>
        </div>

        {children}
      </div>

      {/* Bottom gradient line */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, #C5D5E8, transparent)" }}
      />
    </div>
  );
}
