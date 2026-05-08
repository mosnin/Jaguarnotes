"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { springSnap } from "@/lib/motion";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  wordmark?: boolean;
}

export function Logo({ size = "md", wordmark = true }: LogoProps) {
  const px   = { sm: 24, md: 28, lg: 32 }[size];
  const textCls = { sm: "text-xs", md: "text-sm", lg: "text-base" }[size];

  if (!wordmark) {
    return (
      <motion.span
        whileHover={{ rotate: -5, scale: 1.05 }}
        transition={springSnap}
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-md neu-xs"
        style={{ width: px, height: px }}
      >
        <Image src="/logo.png" alt="Jaguarnotes" width={px} height={px} className="object-contain" priority />
      </motion.span>
    );
  }

  return (
    <motion.div
      className="group flex items-center gap-2.5 cursor-default"
      whileHover={{ scale: 1.02 }}
      transition={springSnap}
    >
      <span
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-md neu-xs transition-all group-hover:neu-sm"
        style={{ width: px, height: px }}
      >
        <Image src="/logo.png" alt="Jaguarnotes" width={px} height={px} className="object-contain" priority />
      </span>
      <span
        className={`${textCls} font-bold tracking-tight text-ink-1 transition-all group-hover:text-ai`}
        style={{ letterSpacing: "-0.01em" }}
      >
        Jaguarnotes
      </span>
    </motion.div>
  );
}
