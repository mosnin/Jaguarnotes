"use client";

import { motion } from "framer-motion";
import { springSnap } from "@/lib/motion";
import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  style,
  children,
  ...props
}: ButtonProps & { style?: React.CSSProperties }) {
  const primaryStyle = variant === "primary" ? { backgroundColor: "#2563EB", ...style } : style;
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={springSnap}
      style={primaryStyle}
      className={clsx(
        "inline-flex items-center justify-center font-semibold transition-opacity",
        variant === "primary" && "rounded-xl neu-btn text-white hover:opacity-90",
        variant === "ghost" && "rounded-lg text-ink-3 hover:text-ink-1",
        size === "sm" && "px-4 py-2 text-xs",
        size === "md" && "px-6 py-3 text-sm",
        size === "lg" && "px-8 py-3.5 text-sm",
        className
      )}
      {...(props as object)}
    >
      {children}
    </motion.button>
  );
}
