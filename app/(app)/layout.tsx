"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SidebarProvider, useSidebar } from "@/components/app/sidebar-context";
import { Sidebar } from "@/components/app/sidebar";

function AppShell({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSidebar();
  return (
    <div className="relative h-screen w-full overflow-hidden bg-app">
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
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Full-bleed content */}
      <main className="h-full w-full overflow-hidden">{children}</main>
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
