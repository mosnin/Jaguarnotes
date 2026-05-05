import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  wordmark?: boolean;
}

export function Logo({ size = "md", wordmark = true }: LogoProps) {
  const px   = { sm: 24, md: 28, lg: 32 }[size];
  const textCls = { sm: "text-xs", md: "text-sm", lg: "text-base" }[size];

  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/logo.png"
        alt="Jaguarnotes"
        width={px}
        height={px}
        className="shrink-0 rounded-md"
        priority
      />
      {wordmark && (
        <span className={`${textCls} font-semibold tracking-tight text-ink-1`}>Jaguarnotes</span>
      )}
    </div>
  );
}
