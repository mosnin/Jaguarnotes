"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { type Toast, toast as toastEmitter } from "@/lib/toast";
import { scaleIn, useMotionVariants } from "@/lib/motion";

const ACCENT: Record<Toast["type"], string> = {
  success: "text-ok",
  error:   "text-error",
  copy:    "text-ai",
  info:    "text-ink-2",
};

const BORDER_COLOR: Record<Toast["type"], string> = {
  success: "#16A34A",
  error:   "#DC2626",
  copy:    "#2563EB",
  info:    "#7B9AB8",
};

const LABEL: Record<Toast["type"], string> = {
  success: "Success notification",
  error:   "Error notification",
  copy:    "Copy notification",
  info:    "Info notification",
};

function ToastItem({ toast: t }: { toast: Toast }) {
  const motionProps = useMotionVariants(scaleIn);
  return (
    <motion.div
      key={t.id}
      layout
      {...motionProps}
      exit="exit"
      aria-label={LABEL[t.type]}
      className="pointer-events-auto flex overflow-hidden rounded-xl border border-line-2 bg-raised text-sm neu-raised"
      style={{ borderLeftColor: BORDER_COLOR[t.type], borderLeftWidth: 3 }}
    >
      <div className="px-4 py-3">
        <span className={ACCENT[t.type]}>{t.message}</span>
      </div>
    </motion.div>
  );
}

export function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsub = toastEmitter.subscribe((t) => {
      setToasts((prev) => {
        const next = [...prev, t];
        return next.length > 3 ? next.slice(next.length - 3) : next;
      });
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 3000);
    });
    return () => { unsub(); };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-24 right-4 z-[60] flex flex-col items-end gap-2 md:bottom-6"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
