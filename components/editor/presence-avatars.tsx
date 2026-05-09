"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { springSnap } from "@/lib/motion";

/* ─── Deterministic color palette ─────────────────────────────────── */

const USER_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#D97706",
  "#16A34A",
  "#0891B2",
  "#9333EA",
];

function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

/* ─── "Actively typing" heuristic ─────────────────────────────────── */
// A presence record updated within the last 8 seconds is treated as
// the user actively typing (heartbeat interval is 15 s, so a fresh
// lastSeen signals a recent interaction rather than just a passive heartbeat).

const TYPING_THRESHOLD_MS = 8_000;

function isActivelyTyping(lastSeen: number): boolean {
  return Date.now() - lastSeen < TYPING_THRESHOLD_MS;
}

/* ─── Props ────────────────────────────────────────────────────────── */

interface PresenceAvatarsProps {
  noteId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserImageUrl?: string;
}

/* ─── Component ────────────────────────────────────────────────────── */

export function PresenceAvatars({
  noteId,
  currentUserId,
  currentUserName,
  currentUserImageUrl,
}: PresenceAvatarsProps) {
  const upsertPresence = useMutation(api.presence.upsert);
  const leavePresence = useMutation(api.presence.leave);
  const activePresence = useQuery(api.presence.getActive, {
    noteId: noteId as Id<"notes">,
  });

  useEffect(() => {
    const noteIdTyped = noteId as Id<"notes">;
    upsertPresence({
      noteId: noteIdTyped,
      userName: currentUserName,
      userImageUrl: currentUserImageUrl,
    });
    const interval = setInterval(() => {
      upsertPresence({
        noteId: noteIdTyped,
        userName: currentUserName,
        userImageUrl: currentUserImageUrl,
      }).catch(() => {});
    }, 15_000);
    return () => {
      clearInterval(interval);
      leavePresence({ noteId: noteIdTyped });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  if (!activePresence) return null;

  const others = activePresence.filter((p) => p.userId !== currentUserId);
  if (others.length === 0) return null;

  const MAX_VISIBLE = 3;
  const visibleUsers = others.slice(0, MAX_VISIBLE);
  const hiddenCount = others.length - visibleUsers.length;

  return (
    /* direction:rtl causes the stack to grow rightward — later items
       slide under earlier ones, so the first user is always on top. */
    <div className="flex items-center" style={{ direction: "rtl" }}>
      <AnimatePresence mode="popLayout">
        {/* Overflow badge — rendered first in DOM so it sits at the
            visual right edge after RTL reversal */}
        {hiddenCount > 0 && (
          <motion.div
            key="overflow"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={springSnap}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-ink-3"
            style={{
              backgroundColor: "#E2EEFF",
              marginLeft: "-8px",
              zIndex: 0,
              direction: "ltr",
            }}
          >
            +{hiddenCount}
          </motion.div>
        )}

        {visibleUsers.map((user, i) => {
          const typing = isActivelyTyping(user.lastSeen);
          const color = getUserColor(user.userId);

          return (
            <motion.div
              key={user.userId}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={springSnap}
              className="relative"
              style={{
                marginLeft: i === 0 ? 0 : "-8px",
                zIndex: visibleUsers.length - i,
                direction: "ltr",
              }}
            >
              {/* Avatar circle */}
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white overflow-hidden"
                title={`${user.userName} is viewing this note`}
                data-tooltip={user.userName}
                style={{
                  backgroundColor: color,
                  boxShadow: "1px 1px 4px rgba(0,0,0,0.15)",
                }}
              >
                {user.userImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.userImageUrl}
                    alt={user.userName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  user.userName.charAt(0).toUpperCase()
                )}
              </div>

              {/* Typing indicator — pulsing dot shown when user is active */}
              {typing && (
                <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                    style={{ backgroundColor: color }}
                  />
                  <span
                    className="relative inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
