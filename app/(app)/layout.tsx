"use client";

import { SidebarProvider, useSidebar } from "@/components/app/sidebar-context";
import { Sidebar } from "@/components/app/sidebar";

function AppShell({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSidebar();
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0a0a0a]">
      {/* Sidebar — fixed overlay, always hidden until summoned */}
      <Sidebar />

      {/* Backdrop — mobile only */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

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
