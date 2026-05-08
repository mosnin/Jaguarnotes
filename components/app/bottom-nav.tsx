"use client";

import { useRouter, usePathname } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSidebar } from "./sidebar-context";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Note01Icon,
  Add01Icon,
  AiBrain01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { motion, AnimatePresence } from "framer-motion";
import { springSnap } from "@/lib/motion";

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const createNote = useMutation(api.notes.create);
  const { toggle: toggleSidebar } = useSidebar();

  async function handleNew() {
    const id = await createNote({ title: "Untitled" });
    router.push(`/notes/${id}`);
  }

  function handleAI() {
    document.dispatchEvent(new CustomEvent("jn:open-slash"));
  }

  const isHome = pathname === "/dashboard";
  const isSettings = pathname.startsWith("/settings");
  const isNotePage = pathname?.startsWith("/notes/");

  if (isNotePage) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-line-1 bg-surface/90 backdrop-blur-md md:hidden relative"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -3px 16px #C5D5E8, 0 -1px 4px rgba(197,213,232,0.6)",
      }}
      aria-label="Main navigation"
    >
      {/* Top edge gradient separator */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #C5D5E8 30%, #C5D5E8 70%, transparent)",
        }}
      />

      <TabButton onClick={() => router.push("/dashboard")} active={isHome} label="Home">
        <HugeiconsIcon icon={Home01Icon} size={22} strokeWidth={1.5} />
      </TabButton>

      <TabButton onClick={toggleSidebar} active={false} label="Notes">
        <HugeiconsIcon icon={Note01Icon} size={22} strokeWidth={1.5} />
      </TabButton>

      {/* Centre new-note action */}
      <motion.button
        onClick={handleNew}
        whileTap={{ scale: 0.90 }}
        transition={springSnap}
        aria-label="New note"
        className="relative flex flex-1 flex-col items-center justify-center min-h-[44px]"
      >
        <span
          className="flex h-11 w-11 items-center justify-center rounded-[18px] neu-btn"
          style={{ background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)" }}
        >
          <HugeiconsIcon icon={Add01Icon} size={20} strokeWidth={2.5} color="white" />
        </span>
      </motion.button>

      <TabButton onClick={handleAI} active={false} label="AI">
        <HugeiconsIcon icon={AiBrain01Icon} size={22} strokeWidth={1.5} />
      </TabButton>

      <TabButton onClick={() => router.push("/settings")} active={isSettings} label="Settings">
        <HugeiconsIcon icon={Settings01Icon} size={22} strokeWidth={1.5} />
      </TabButton>
    </nav>
  );
}

function TabButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      transition={springSnap}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors ${
        active ? "text-ai" : "text-ink-4 hover:text-ink-2"
      }`}
    >
      {/* Active indicator dot above icon */}
      <AnimatePresence>
        {active && (
          <motion.span
            key="dot"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={springSnap}
            className="absolute top-1 h-1 w-1 rounded-full"
            style={{ backgroundColor: "#2563EB" }}
          />
        )}
      </AnimatePresence>
      <span className={active ? "text-ai" : ""}>{children}</span>
      <span className={`text-[9px] font-semibold ${active ? "text-ai" : "text-ink-4"}`}>{label}</span>
    </motion.button>
  );
}
