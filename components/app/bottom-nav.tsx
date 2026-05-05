"use client";

import { useRouter, usePathname } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSidebar } from "./sidebar-context";

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
  const isNotePage = pathname?.startsWith("/notes/");

  if (isNotePage) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-line-1 bg-surface md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <TabButton onClick={() => router.push("/dashboard")} active={isHome} label="Home">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </TabButton>

      <TabButton onClick={toggleSidebar} active={false} label="Notes">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </TabButton>

      <TabButton onClick={handleNew} active={false} label="New">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      </TabButton>

      <TabButton onClick={handleAI} active={false} label="AI">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.214.107a2.25 2.25 0 001.357.126l.214-.107A2.25 2.25 0 0019.5 8.818V3.104m-9.75 0A24.255 24.255 0 0112 3" />
        </svg>
      </TabButton>
    </nav>
  );
}

function TabButton({ onClick, active, label, children }: {
  onClick: () => void;
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex flex-1 flex-col items-center justify-center gap-1 min-h-[44px] transition-colors ${
        active ? "text-ai" : "text-ink-4 hover:text-ink-2"
      }`}
    >
      {children}
      <span className="text-[10px]">{label}</span>
    </button>
  );
}
