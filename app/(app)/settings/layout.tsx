"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/app/sidebar-context";
import { motion } from "framer-motion";
import { buttonTap } from "@/lib/motion";

const NAV = [
  {
    href: "/settings/profile",
    label: "Profile",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    href: "/settings/preferences",
    label: "Preferences",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/settings/account",
    label: "Account",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toggle } = useSidebar();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex h-10 shrink-0 items-center gap-3 px-6 md:px-8">
        <motion.button
          {...buttonTap}
          onClick={toggle}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-4 hover:bg-raised hover:text-ink-2"
          aria-label="Toggle sidebar"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
        <span className="text-sm font-medium text-ink-2">Settings</span>
      </div>

      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* Left settings nav */}
        <nav className="hidden w-52 shrink-0 flex-col gap-1 border-r border-line-1 px-3 py-4 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "bg-raised text-ink-1 neu-sm"
                    : "text-ink-3 hover:bg-hover hover:text-ink-2"
                }`}
              >
                <span className={active ? "text-ai" : "text-ink-4"}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile tab bar */}
        <nav className="flex shrink-0 gap-0 border-b border-line-1 px-4 md:hidden w-full absolute left-0 top-10 bg-surface z-10">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-0.5 px-2 py-3 text-[10px] transition-colors ${
                  active ? "text-ai border-b-2 border-ai" : "text-ink-4"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 pt-16 md:px-10 md:pt-6">
          {children}
        </div>
      </div>
    </div>
  );
}
