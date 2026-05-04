interface LogoProps {
  size?: "sm" | "md" | "lg";
  wordmark?: boolean;
}

/** Shared logomark — spark SVG on AI-indigo gradient, optional wordmark. */
export function Logo({ size = "md", wordmark = true }: LogoProps) {
  const containerCls = { sm: "h-6 w-6 rounded-md", md: "h-7 w-7 rounded-lg", lg: "h-8 w-8 rounded-lg" }[size];
  const iconCls      = { sm: "h-3.5 w-3",          md: "h-4 w-3.5",          lg: "h-[18px] w-4"       }[size];
  const textCls      = { sm: "text-xs",             md: "text-sm",            lg: "text-base"           }[size];

  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex ${containerCls} shrink-0 items-center justify-center bg-gradient-to-br from-[#7474ff] to-violet-500`}>
        {/* Lightning-bolt spark — speed of thought */}
        <svg viewBox="0 0 14 16" fill="none" className={iconCls}>
          <path d="M8 1L2 9h5.5L5 15l7-8H6.5z" fill="white" />
        </svg>
      </div>
      {wordmark && (
        <span className={`${textCls} font-semibold tracking-tight text-ink-1`}>Jaguarnotes</span>
      )}
    </div>
  );
}
