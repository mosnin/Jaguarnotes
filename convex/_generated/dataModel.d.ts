/* eslint-disable */
/**
 * Generated data model types — do not edit. Run `npx convex dev` to regenerate.
 */
import type { GenericId } from "convex/values";

export type Id<TableName extends string> = GenericId<TableName>;

export type DataModel = {
  notes: {
    _id: Id<"notes">;
    _creationTime: number;
    userId: string;
    title: string;
    content?: string;
    preview?: string;
    emoji?: string;
    pinned?: boolean;
    aiBlockIds?: string[];
    tags?: string[];
    linkedNoteIds?: Id<"notes">[];
    backlinkIds?: Id<"notes">[];
    parentId?: Id<"notes">;
    updatedAt?: number;
  };
  users: {
    _id: Id<"users">;
    _creationTime: number;
    clerkId: string;
    email: string;
    name?: string;
    role?: string;
    useCases?: string[];
    onboarded?: boolean;
  };
  shares: {
    _id: Id<"shares">;
    _creationTime: number;
    noteId: Id<"notes">;
    ownerId: string;
    token: string;
    permission: "view" | "edit";
    collaboratorIds?: string[];
    expiresAt?: number;
  };
  presence: {
    _id: Id<"presence">;
    _creationTime: number;
    noteId: Id<"notes">;
    userId: string;
    userName: string;
    userImageUrl?: string;
    lastSeen: number;
  };
};
