"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { springSnap, springStd } from "@/lib/motion";

const COVER_OPTIONS: { label: string; value: string; preview: string }[] = [
  {
    label: "Ocean",
    value: "linear-gradient(135deg, #EDF4FF 0%, #DCF0FF 100%)",
    preview: "from-[#EDF4FF] to-[#DCF0FF]",
  },
  {
    label: "Lavender",
    value: "linear-gradient(135deg, #EDE8FF 0%, #D4C5FF 100%)",
    preview: "from-[#EDE8FF] to-[#D4C5FF]",
  },
  {
    label: "Amber",
    value: "linear-gradient(135deg, #FFF5DC 0%, #FFE8B0 100%)",
    preview: "from-[#FFF5DC] to-[#FFE8B0]",
  },
  {
    label: "Sage",
    value: "linear-gradient(135deg, #E3F5E1 0%, #C8EFC4 100%)",
    preview: "from-[#E3F5E1] to-[#C8EFC4]",
  },
  {
    label: "Rose",
    value: "linear-gradient(135deg, #FFE4F0 0%, #FFD0E4 100%)",
    preview: "from-[#FFE4F0] to-[#FFD0E4]",
  },
  {
    label: "Slate",
    value: "linear-gradient(135deg, #F4F8FF 0%, #E2EEFF 100%)",
    preview: "from-[#F4F8FF] to-[#E2EEFF]",
  },
  {
    label: "Peach",
    value: "linear-gradient(135deg, #FFE8DF 0%, #FFC9B0 100%)",
    preview: "from-[#FFE8DF] to-[#FFC9B0]",
  },
  {
    label: "Teal",
    value: "linear-gradient(135deg, #E0F4F4 0%, #C2ECEC 100%)",
    preview: "from-[#E0F4F4] to-[#C2ECEC]",
  },
];

interface NoteCoverProps {
  coverColor: string | undefined;
  onCoverChange: (color: string | undefined) => void;
}

export function NoteCover({ coverColor, onCoverChange }: NoteCoverProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    if (!showPicker) return;
    function handleClick(e: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPicker]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover area */}
      <div
        className="relative w-full overflow-hidden transition-all duration-300"
        style={{
          height: coverColor ? "80px" : "24px",
          background: coverColor ?? "transparent",
          borderRadius: coverColor ? "0 0 12px 12px" : undefined,
        }}
      >
        {/* Action buttons — visible on hover or when cover exists */}
        <AnimatePresence>
          {(isHovered || showPicker) && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 2 }}
              transition={springSnap}
              className="absolute bottom-2 left-3 flex items-center gap-1.5"
            >
              {coverColor ? (
                <>
                  <button
                    onClick={() => setShowPicker((v) => !v)}
                    className="rounded-md border border-line-2 bg-surface/90 px-2.5 py-1 text-[10px] font-medium text-ink-3 backdrop-blur-sm transition-colors hover:bg-raised hover:text-ink-1 neu-xs"
                  >
                    Change
                  </button>
                  <button
                    onClick={() => {
                      onCoverChange(undefined);
                      setShowPicker(false);
                    }}
                    className="rounded-md border border-line-2 bg-surface/90 px-2.5 py-1 text-[10px] font-medium text-ink-4 backdrop-blur-sm transition-colors hover:bg-raised hover:text-ink-2 neu-xs"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowPicker((v) => !v)}
                  className="rounded-md border border-line-2 bg-surface/90 px-2.5 py-1 text-[10px] font-medium text-ink-4 backdrop-blur-sm transition-colors hover:bg-raised hover:text-ink-2 neu-xs"
                >
                  + Add cover
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Color picker panel */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -3 }}
            transition={springStd}
            className="absolute left-0 top-full z-50 mt-1 rounded-xl border border-line-2 bg-surface p-3 neu-card"
            style={{ minWidth: "260px" }}
          >
            <p className="mb-2 text-[10px] uppercase tracking-widest text-ink-4">Cover color</p>
            <div className="grid grid-cols-4 gap-2">
              {COVER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onCoverChange(opt.value);
                    setShowPicker(false);
                  }}
                  title={opt.label}
                  className="group relative h-10 w-full overflow-hidden rounded-lg border-2 transition-all hover:scale-105"
                  style={{
                    background: opt.value,
                    borderColor:
                      coverColor === opt.value
                        ? "rgb(37,99,235)"
                        : "transparent",
                  }}
                >
                  {coverColor === opt.value && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="h-3.5 w-3.5 text-[#2563EB] drop-shadow"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  )}
                  <span className="sr-only">{opt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
