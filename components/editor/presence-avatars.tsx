"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface PresenceAvatarsProps {
  noteId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserImageUrl?: string;
}

export function PresenceAvatars({ noteId, currentUserId, currentUserName, currentUserImageUrl }: PresenceAvatarsProps) {
  const upsertPresence = useMutation(api.presence.upsert);
  const leavePresence = useMutation(api.presence.leave);
  const activePresence = useQuery(api.presence.getActive, { noteId: noteId as Id<"notes"> });

  useEffect(() => {
    const noteIdTyped = noteId as Id<"notes">;
    upsertPresence({ noteId: noteIdTyped, userName: currentUserName, userImageUrl: currentUserImageUrl });
    const interval = setInterval(() => {
      upsertPresence({ noteId: noteIdTyped, userName: currentUserName, userImageUrl: currentUserImageUrl }).catch(() => {});
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

  const visible = others.slice(0, 3);
  const overflow = others.length - visible.length;

  return (
    <div className="flex items-center -space-x-1.5">
      {visible.map((p) => (
        <div
          key={p.userId}
          title={p.userName}
          className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border-2 border-surface bg-ai-dim"
        >
          {p.userImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.userImageUrl} alt={p.userName} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[9px] font-medium text-ai">
              {p.userName.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-raised text-[9px] font-medium text-ink-3">
          +{overflow}
        </div>
      )}
    </div>
  );
}
