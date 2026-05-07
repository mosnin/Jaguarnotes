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
      className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-line-1 bg-surface md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Main navigation"
    >
      <TabButton onClick={() => router.push("/dashboard")} active={isHome} label="Home">
        <HugeiconsIcon icon={Home01Icon} size={22} strokeWidth={1.5} />
      </TabButton>

      <TabButton onClick={toggleSidebar} active={false} label="Notes">
        <HugeiconsIcon icon={Note01Icon} size={22} strokeWidth={1.5} />
      </TabButton>

      {/* Centre new-note action */}
      <button
        onClick={handleNew}
        aria-label="New note"
        className="relative flex flex-1 flex-col items-center justify-center gap-1 min-h-[44px] transition-all active:scale-95"
      >
        <span
          className="flex h-10 w-10 items-center justify-center rounded-2xl neu-btn transition-all"
          style={{ backgroundColor: "#2563EB" }}
        >
          <HugeiconsIcon icon={Add01Icon} size={20} strokeWidth={2} color="white" />
        </span>
      </button>

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
    <button
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`flex flex-1 flex-col items-center justify-center gap-1 min-h-[44px] transition-colors ${
        active ? "text-ai" : "text-ink-4 hover:text-ink-2"
      }`}
    >
      {children}
      <span className="text-[10px]">{label}</span>
    </button>
  );
}
