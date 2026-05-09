"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { springSnap, springStd } from "@/lib/motion";

const COVER_OPTIONS: { label: string; value: string; preview: string }[] = [
  {
    label: "Sky",
    value: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)",
    preview: "from-[#DBEAFE] to-[#BFDBFE]",
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
    value: "linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)",
    preview: "from-[#F1F5F9] to-[#E2E8F0]",
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
  {
    label: "Midnight",
    value: "linear-gradient(135deg, #DBEAFE 0%, #C7D2FE 50%, #DDD6FE 100%)",
    preview: "from-blue-100 to-purple-200",
  },
  {
    label: "Dusk",
    value: "linear-gradient(135deg, #FCE7F3 0%, #E9D5FF 50%, #BFDBFE 100%)",
    preview: "from-pink-100 to-blue-200",
  },
  {
    label: "Forest",
    value: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 50%, #6EE7B7 100%)",
    preview: "from-green-100 to-emerald-300",
  },
  {
    label: "Coral",
    value: "linear-gradient(135deg, #FEF3C7 0%, #FECACA 50%, #FCA5A5 100%)",
    preview: "from-amber-100 to-red-300",
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
        className={`relative w-full overflow-hidden${coverColor ? " h-32 md:h-40" : " h-6"}`}
        style={{
          background: coverColor ?? "transparent",
          borderRadius: coverColor ? "0 0 12px 12px" : undefined,
          transition: "height 0.3s ease",
        }}
      >
        <AnimatePresence>
          {coverColor ? (
            /* Hover overlay with Change / Remove buttons */
            isHovered || showPicker ? (
              <motion.div
                key="cover-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={springSnap}
                className="absolute inset-0 flex items-center justify-center gap-3"
                style={{
                  background: "rgba(27,54,82,0.25)",
                  backdropFilter: "blur(2px)",
                }}
              >
                <button
                  onClick={() => setShowPicker(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-xs font-semibold text-ink-1 hover:bg-white transition-colors"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Change
                </button>
                <button
                  onClick={() => {
                    onCoverChange(undefined);
                    setShowPicker(false);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-xs font-semibold text-ink-2 hover:bg-white transition-colors"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Remove
                </button>
              </motion.div>
            ) : null
          ) : (
            /* "Add cover" trigger — shown when no cover is set and area is hovered */
            <motion.button
              key="add-cover"
              whileHover={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              onClick={() => setShowPicker(true)}
              className="absolute top-2 left-4 flex items-center gap-1.5 rounded-lg bg-white/70 px-2.5 py-1 text-xs font-medium text-ink-2 backdrop-blur-sm hover:bg-white/90 transition-colors"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Add cover
            </motion.button>
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
            className="absolute left-0 top-full z-50 mt-1 bg-surface neu-lg rounded-2xl p-4"
            style={{ minWidth: "280px" }}
          >
            <p className="mb-3 text-[10px] uppercase tracking-widest text-ink-4">
              Cover color
            </p>
            {/* 4-column × 3-row grid for 12 options */}
            <div className="grid grid-cols-4 gap-2">
              {COVER_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex flex-col items-center">
                  <button
                    onClick={() => {
                      onCoverChange(opt.value);
                      setShowPicker(false);
                    }}
                    title={opt.label}
                    className="h-12 w-full rounded-xl cursor-pointer transition-all hover:scale-105"
                    style={{
                      background: opt.value,
                      boxShadow:
                        coverColor === opt.value
                          ? "0 0 0 2px #fff, 0 0 0 4px #2563EB"
                          : undefined,
                    }}
                  >
                    <span className="sr-only">{opt.label}</span>
                  </button>
                  <span className="text-[9px] text-ink-3 text-center mt-1">
                    {opt.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
