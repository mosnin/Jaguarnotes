"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SidebarProvider, useSidebar } from "@/components/app/sidebar-context";
import { Sidebar } from "@/components/app/sidebar";
import { BottomNav } from "@/components/app/bottom-nav";
import { ToastHost } from "@/components/ui/toast";
import { SearchModal } from "@/components/app/search-modal";
import { ShortcutsModal } from "@/components/ui/shortcuts-modal";

function AppShell({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSidebar();
  const [showSearch, setShowSearch] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const searchTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch((v) => !v);
      }
      const target = e.target as HTMLElement;
      const isEditing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !isEditing) {
        setShowShortcuts((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden bg-app"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.025) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      {/* Sidebar — spring-animated overlay */}
      <Sidebar />

      {/* Backdrop — mobile only, frosted glass fades in/out */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 lg:hidden"
            style={{
              background: "rgba(237,244,255,0.6)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Full-bleed content */}
      <main className="h-full w-full overflow-hidden transition-all duration-300 pb-16 md:pb-0">{children}</main>
      <BottomNav />
      <ToastHost />

      {/* Global overlays */}
      {showSearch && <SearchModal onDismiss={() => setShowSearch(false)} triggerRef={searchTriggerRef} />}
      {showShortcuts && <ShortcutsModal onDismiss={() => setShowShortcuts(false)} />}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppShell>{children}</AppShell>
    </SidebarProvider>
  );
}
