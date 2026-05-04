"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { type Toast, toast as toastEmitter } from "@/lib/toast";
import { scaleIn } from "@/lib/motion";

const ACCENT: Record<Toast["type"], string> = {
  success: "text-ok",
  error: "text-error",
  copy: "text-ai",
  info: "text-ink-2",
};

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
    <div className="pointer-events-none fixed bottom-20 right-4 z-[60] flex flex-col items-end gap-2 md:bottom-6">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            variants={scaleIn}
            initial="hidden"
            animate="show"
            exit="exit"
            className="pointer-events-auto rounded-xl border border-line-2 bg-raised px-4 py-3 text-sm shadow-xl shadow-black/50"
          >
            <span className={ACCENT[t.type]}>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
