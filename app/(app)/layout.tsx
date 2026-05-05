"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch((v) => !v);
      }
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && (e.target as HTMLElement).tagName !== "INPUT" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
        setShowShortcuts((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-app">
      {/* Sidebar — spring-animated overlay */}
      <Sidebar />

      {/* Backdrop — mobile only, fades in/out */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Full-bleed content */}
      <main className="h-full w-full overflow-hidden pb-16 md:pb-0">{children}</main>
      <BottomNav />
      <ToastHost />

      {/* Global overlays */}
      {showSearch && <SearchModal onDismiss={() => setShowSearch(false)} />}
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
