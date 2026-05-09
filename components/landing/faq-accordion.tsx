"use client";

import { useState } from "react";

const FAQS = [
  { q: "Is it really free?",             a: "Yes. Create an account and start using all 14 AI commands immediately, no credit card required." },
  { q: "Which AI model powers it?",      a: "GPT-4o mini — fast, accurate, and optimized for structured generation tasks like tables, outlines, and diagrams." },
  { q: "Is my data private?",            a: "Notes are stored securely in Convex and tied to your account. We do not train on your content." },
  { q: "Can I use it offline?",          a: "The editor is accessible offline, but AI commands and real-time sync require a connection." },
  { q: "Does it work on mobile?",        a: "Yes. The app is fully responsive with a dedicated mobile bottom nav and touch-friendly editor." },
];

export function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {FAQS.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={faq.q}
            className="rounded-2xl border border-line-1 bg-surface neu-sm overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold select-none text-left text-ink-1"
              aria-expanded={isOpen}
            >
              <span>{faq.q}</span>
              <svg
                className="ml-4 h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              style={{
                display: "grid",
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: "grid-template-rows 0.2s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <p className="px-5 pb-5 text-sm leading-relaxed text-ink-2">
                  {faq.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
