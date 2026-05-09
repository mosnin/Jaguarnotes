# 00 App Idea

## App Name

Jaguarnotes

## One Sentence Product Definition

Jaguarnotes is an AI-native note-taking platform where the AI is the co-author — it generates content, builds structure, and expands ideas on demand via slash commands and autocomplete.

## Core User

Knowledge workers, researchers, founders, and students who think for a living and want an intelligent writing partner rather than a blank canvas. Primary: solo users who create and manage many notes and use AI to think faster.

## Core Problem

Existing note apps (Notion, Obsidian, Apple Notes) are passive containers. Users still do 100% of the thinking and structuring. The AI features bolted onto these apps are chatbots — they break the user's flow by requiring a separate interaction. Jaguarnotes bakes intelligence directly into every keystroke.

## Core Outcome

Users go from a topic or seed phrase to a fully structured, AI-expanded note in under 60 seconds. The AI is the primary author — the user directs, the AI executes.

## First Value Event

User opens a new note, triggers a slash command (e.g. `/brainstorm startup ideas`), and sees AI-generated content stream directly into the editor. The note is now populated with real, usable content without leaving the keyboard.

## Main Product Workflow

Dashboard → New note → Title typed → Slash command or Tab autocomplete triggered → AI content streams into editor → Note saved in real time → Return to dashboard or continue writing.

## Dashboard Definition

"My Notes" card carousel (horizontal scroll, filtered by Today/This Week/This Month). Quick Start action row (AI commands personalized to user role). Tags section as folder icons. Empty state prompts brainstorming. All content is real-time via Convex subscriptions.

## Onboarding Definition

Step 1: Role selection (researcher, founder, writer, student, other). Step 2: Use case selection (multi-select). Step 3: First note creation with guided AI command. Skip available after step 1.

## Required Internal Modules

- AI Command Engine (14 slash commands via GPT-4o mini)
- AI Autocomplete (Tab trigger, context-aware)
- Real-time sync (Convex subscriptions)
- Sharing (share links with view/edit permissions)
- Collaborative presence (live cursors)
- Note graph (links, backlinks, sub-notes)
- Version history
- Export (Markdown)

## Product Specific Features

14 AI slash commands (table, diagram, explain, brainstorm, outline, compress, punch, counter, sowhat, assume, question, premortem, brief, research). Tab autocomplete. Block-based editor (BlockNote). Emoji icons per note. Tags. Pinned notes. Linked notes (wiki-style). Sub-notes (2-level hierarchy). Share links with view/edit permissions. Real-time collaborative presence. Version history. Markdown export. Keyboard shortcut system (Cmd+K search, ? for shortcuts).

## Product Specific Entities

- **Note**: userId, title, content (BlockNote JSON), preview, emoji, pinned, aiBlockIds, tags, linkedNoteIds, backlinkIds, parentId, updatedAt
- **User**: clerkId, email, name, role, useCases, onboarded
- **Share**: noteId, ownerId, token, permission (view/edit), collaboratorIds, expiresAt
- **Presence**: noteId, userId, userName, userImageUrl, lastSeen
- **NoteVersion**: noteId, userId, title, content, preview, savedAt

## Roles And Permissions

Single role: authenticated user. Every user owns their own notes. Share links grant access to specific notes only. No multi-tenant org structure in v1.

## Integrations Or External Config

- OpenAI (GPT-4o mini for all 14 AI commands and autocomplete)
- Tavily (web search context for explain, table, diagram, research commands)
- Clerk (authentication, user management, sessions)
- Convex (real-time database, serverless functions)
- Vercel (hosting, edge functions)

## Admin Requirements

Not in v1 scope. Future: usage dashboard, user list, system health monitoring.

## V1 Scope

Note CRUD, BlockNote editor, 14 AI slash commands, Tab autocomplete, real-time sync, sharing, presence, tags, pinned notes, linked notes, sub-notes, version history, Markdown export, dashboard with card carousel, onboarding, keyboard shortcut system, mobile responsive.

## Non Goals

Multi-tenant organizations, billing/subscription tiers, admin panel, email notifications, mobile native apps, offline mode, integrations (Slack, Notion import), public publish/blog, comments/reactions, templates marketplace, API access.

## UX Constraints

AI commands must feel instant — content streams directly into the editor without modal interruptions. Editor must be keyboard-first. Mobile must support full note editing and AI commands. No page reloads inside the app.

## Technical Constraints

Must use Convex for all data persistence and real-time sync (not Prisma/PostgreSQL). Must use Clerk for authentication. Must use GPT-4o mini for AI features. BlockNote for rich text editing. All AI responses stream over HTTP.

## Success Criteria

New user reaches first AI-generated note within 3 minutes of signup. AI command response starts streaming within 2 seconds. Note saves automatically with zero user-initiated saves. Dashboard loads in under 1 second.
