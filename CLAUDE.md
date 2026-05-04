# Jaguarnotes — AI Agent Note-Taking Platform

## Concept

Jaguarnotes is a real-time, AI agent-driven note-taking application inspired by Notion but fundamentally reimagined around artificial intelligence. Where Notion is a blank canvas you fill manually, Jaguarnotes is an intelligent co-author — the AI doesn't assist you, it works alongside you, generating content, building structure, and expanding ideas on demand.

Users type naturally, invoke slash commands, and trigger AI-powered autocomplete to have concepts, tables, diagrams, and structured content generated inline — without ever leaving the keyboard. Every note is a live document, synced in real time across devices and collaborators.

This is not a notes app with an AI button. This is an AI-native workspace where every surface has intelligence baked in.

---

## Vision

The world does not need another Notion clone. The world needs the first note-taking platform where the AI is the primary author and the human is the director. Jaguarnotes gives knowledge workers, builders, researchers, and founders a thinking partner that never sleeps — one that can explain a concept, scaffold a plan, draw a diagram, or build a table from a single typed phrase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) |
| Backend | Convex (real-time database + serverless functions) |
| Auth | Clerk |
| AI Agents | OpenAI Agents SDK |
| AI Model | GPT-4o mini |
| Sandboxes | Daytona (AgenTex sandboxes) |
| Hosting | Vercel |

---

## Core Features

### Landing Page (logged out)
- High-design, conversion-focused landing page
- Communicates the AI-native value proposition immediately
- Clear CTAs to sign up
- No bloat, no feature lists — sell the feeling and the outcome

### Authentication
- Sign up page (Clerk)
- Login page (Clerk)
- Onboarding flow for new users — personalizes the workspace, sets expectations, introduces AI features

### Note Editor
- Rich block-based editor (similar to Notion blocks)
- Real-time sync via Convex subscriptions
- Collaborative — multiple users can edit simultaneously

### AI Autocomplete
- Trigger with Tab or a keyboard shortcut while typing
- Detects the concept or phrase at the cursor
- Calls an OpenAI Agents SDK agent to generate a concise, contextually relevant expansion inline
- Example: type "AI agent harness", trigger autocomplete → editor fills with a sharp, accurate definition

### Slash Commands (AI-generated content)
- `/table [topic]` — generates a fully populated table on the requested topic
- `/diagram [concept]` — generates a text-based or Mermaid diagram for the concept
- `/explain [term]` — inserts a structured explanation block
- `/brainstorm [topic]` — generates a bulleted idea list
- `/outline [subject]` — generates a structured document outline
- All slash command output is AI-generated via agents — no manual input required

### AI Agents (OpenAI Agents SDK + Daytona)
- Each AI command triggers a scoped agent with a specific system prompt and tool set
- Daytona sandboxes isolate agent execution for security and reproducibility
- Agents have access to tools: web search, code execution, diagram generation
- Agent responses are streamed back into the editor in real time

---

## File & Folder Structure (planned)

```
/app                    — Next.js App Router pages
  /(auth)               — Sign up, login (Clerk)
  /(onboarding)         — New user onboarding flow
  /(app)                — Authenticated app shell
    /dashboard          — Note list / home
    /notes/[id]         — Individual note editor
/components             — Shared UI components
/convex                 — Convex schema, queries, mutations, actions
/lib                    — Utility functions, agent definitions
/agents                 — OpenAI Agents SDK agent configurations
/public                 — Static assets
```

---

## Non-Negotiable Principles

### Think like Steve Jobs — for every product and feature decision

- **Ruthless simplicity.** If a feature needs explanation, it is not finished. Strip everything to its essential truth.
- **Design is not decoration.** Every pixel, every interaction, every word is a product decision. Polish is respect for the user.
- **The user should feel something.** Jaguarnotes should feel like the future — fast, intelligent, alive. Not a tool. An experience.
- **Say no to a thousand things.** Every feature we add dilutes every feature we have. Fewer, better.
- **Start with the customer experience and work backward to the technology.** Not the other way around.
- **Insanely great is the bar.** Good enough is failure.

### Think like Elon Musk — for every engineering and architecture decision

- **First principles, always.** Question every assumption. Why does a note editor work this way? Could it work fundamentally better?
- **Delete before you add.** The best code is no code. The best process step is no process step. Remove aggressively.
- **Optimize for scale from day one.** Convex, Vercel, and the OpenAI Agents SDK are chosen because they scale. Design the data model and agent architecture as if you have 10 million users from the start.
- **Speed is a feature.** Latency is the enemy. Every AI response, every real-time sync, every page load must be fast. Measure it. Fix it.
- **Vertical integration of intelligence.** Own the AI loop end to end — from the editor keystroke to the agent execution in a Daytona sandbox to the streamed response back into the block. No black boxes.
- **Ship, measure, iterate.** Perfection is the enemy of momentum. Build the right thing fast, not the perfect thing slow.
- **The constraint is the design.** Resource constraints force elegant solutions. Embrace them.

---

## Development Workflow

- Branch: `claude/ai-note-app-3N6Zk`
- All changes committed and pushed to the feature branch
- PRs created as drafts for review
- Convex dev environment runs locally alongside Next.js dev server
- Clerk development instance for auth during local development

---

## Agent Architecture (high-level)

```
User types in editor
  → Slash command or autocomplete triggered
    → Next.js API route receives request
      → OpenAI Agents SDK agent initialized with context
        → Agent runs in Daytona sandbox (isolated)
          → Agent calls tools (search, compute, format)
            → Response streams back via Convex mutation or server-sent events
              → Editor inserts generated content at cursor position
```

The agent is not a chatbot. It is a focused, single-purpose executor. Each command type has its own agent with a tightly scoped system prompt and tool access. This keeps output quality high and latency low.

---

## What This Is Not

- Not a chatbot interface bolted onto a note app
- Not a Notion AI wrapper
- Not a feature-complete clone of anything
- Not a product designed by committee

This is a focused, opinionated, AI-native tool for people who think for a living.

---

## Local Development Setup

1. Copy environment variables: `cp .env.local.example .env.local` (then fill in the values — see Environment Variables below)
2. Install dependencies: `npm install`
3. Start Convex dev server (keep this terminal running): `npx convex dev`
4. In a second terminal, start Next.js: `npm run dev`
5. Open http://localhost:3000

> **Note:** Convex dev must be running alongside Next.js — it handles the real-time database, auth verification, and serverless functions. If Convex is not running, note saves, real-time sync, and auth will fail silently.

**Available npm scripts:**

| Script | Command | Purpose |
|---|---|---|
| dev | `npm run dev` | Start Next.js development server |
| build | `npm run build` | Production build |
| start | `npm run start` | Run production build locally |
| lint | `npm run lint` | Run ESLint |

---

## Environment Variables

All variables are required for full functionality. The app will start without them but AI features, auth, and data persistence will not work.

| Variable | Source | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Convex dashboard > Settings > URL & Deploy Key | Public URL for the Convex deployment — used by the client to connect to the real-time database |
| `CONVEX_DEPLOY_KEY` | Convex dashboard > Settings > URL & Deploy Key | Server-side deploy key for Convex — used for CI/CD deployments and server-side mutations |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard > API Keys | Public key for Clerk auth — used by the browser to initialize the Clerk session |
| `CLERK_SECRET_KEY` | Clerk dashboard > API Keys | Secret key for Clerk — used server-side to verify sessions in API routes and Convex actions |
| `OPENAI_API_KEY` | platform.openai.com | Powers all 14 AI commands and autocomplete — all requests go through GPT-4o mini |
| `TAVILY_API_KEY` | app.tavily.com | Web search context for the `explain`, `table`, `diagram`, and `research` commands — fetches up to 3 live search results before generation |

A `.env.local.example` file is checked into the repo with the correct variable names and placeholder values.

---

## API Reference

### POST /api/ai/command

Executes an AI slash command and streams the result back to the editor.

- **Auth:** Clerk session required (401 if missing or invalid)
- **Rate limit:** 20 requests/min per user (429 if exceeded)
- **Content-Type:** `application/json`
- **Response:** `text/plain` streaming (chunked transfer encoding)

**Request body:**

```json
{ "command": "table", "topic": "machine learning algorithms" }
```

| Field | Type | Description |
|---|---|---|
| `command` | string | One of the 14 valid command names (see below) |
| `topic` | string | The subject or content passed to the AI agent |

**Valid commands:**

| Command | Purpose |
|---|---|
| `table` | Generates a fully populated markdown table (4-6 columns, 5-8 rows) |
| `diagram` | Generates a Mermaid.js diagram (flowchart, sequence, graph, etc.) |
| `explain` | Structured explanation: definition, key points, why it matters |
| `brainstorm` | 8-12 sharp, creative ideas as a numbered list |
| `outline` | Document outline with H2 sections and H3 subsections |
| `research` | 300-word synthesis from live web search results |
| `compress` | Distills the input to one sharp, essential paragraph |
| `punch` | Rewrites input to be harder, faster, more direct |
| `counter` | Generates the strongest counter-argument to the input |
| `sowhat` | Surfaces the real implication — the unstated "so what" |
| `assume` | Lists every buried assumption in the input |
| `question` | Generates the 5 most important questions not being asked |
| `premortem` | Imagines the plan failing and explains exactly how and why |
| `brief` | Collapses input into a tight executive brief |

**Error codes:**

| Code | Meaning |
|---|---|
| 400 | Invalid or missing `command` / `topic` |
| 401 | Unauthenticated — Clerk session missing or expired |
| 429 | Rate limited — 20 requests/min per user exceeded |

---

### POST /api/ai/autocomplete

Generates an inline completion based on the current editor context.

- **Auth:** Clerk session required (401 if missing or invalid)
- **Rate limit:** 30 requests/min per user (429 if exceeded)
- **Content-Type:** `application/json`
- **Response:** `text/plain` streaming (chunked transfer encoding)

**Request body:**

```json
{ "context": "The transformer architecture works by..." }
```

| Field | Type | Description |
|---|---|---|
| `context` | string | The last ~200 characters of editor content at the cursor position — used to generate a contextually relevant continuation |

**Error codes:**

| Code | Meaning |
|---|---|
| 400 | Missing or empty `context` |
| 401 | Unauthenticated — Clerk session missing or expired |
| 429 | Rate limited — 30 requests/min per user exceeded |

---

## Convex Schema

The schema is defined in `/convex/schema.ts`. There are four tables.

### notes

The primary content table. Each row is one note owned by one user.

| Field | Type | Description |
|---|---|---|
| `userId` | string | Clerk user ID of the note owner |
| `title` | string | Note title — also the full-text search field |
| `content` | string? | JSON-serialized BlockNote block array — the full editor state |
| `preview` | string? | Plain text excerpt shown on the dashboard card |
| `emoji` | string? | Optional emoji icon for the note |
| `pinned` | boolean? | Whether the note is pinned to the top of the dashboard |
| `aiBlockIds` | string[]? | IDs of blocks that were AI-generated — used for highlighting |
| `tags` | string[]? | User-defined tag strings |
| `linkedNoteIds` | id("notes")[]? | Outbound links to other notes (wiki-style) |
| `backlinkIds` | id("notes")[]? | Inbound links from other notes — updated when another note links here |
| `parentId` | id("notes")? | Parent note ID for nested/child notes |
| `updatedAt` | number? | Unix timestamp (ms) of last modification |

**Indexes:**

| Index | Fields | Use |
|---|---|---|
| `by_user` | `[userId]` | Fetch all notes for a user (dashboard list) |
| `by_user_pinned` | `[userId, pinned]` | Fetch pinned notes for a user |
| `by_user_parent` | `[userId, parentId]` | Fetch child notes under a parent |
| `search_notes` | search: `title`, filter: `userId` | Full-text search within a user's notes |

---

### users

One row per authenticated user, created during onboarding.

| Field | Type | Description |
|---|---|---|
| `clerkId` | string | Clerk user ID — the primary identifier across the app |
| `email` | string | User's email address from Clerk |
| `name` | string? | Display name |
| `role` | string? | Self-reported role from onboarding (e.g. "founder", "researcher") |
| `useCases` | string[]? | Self-reported use cases selected during onboarding |
| `onboarded` | boolean? | Whether the user has completed the onboarding flow |

**Indexes:** `by_clerk_id` on `[clerkId]`

---

### shares

Tracks share links and collaborator access for notes.

| Field | Type | Description |
|---|---|---|
| `noteId` | id("notes") | The note being shared |
| `ownerId` | string | Clerk user ID of the note owner |
| `token` | string | Unique random token used in the share URL |
| `permission` | "view" \| "edit" | Access level granted by this share link |
| `collaboratorIds` | string[]? | Array of Clerk user IDs who have explicitly accepted access via this share link |

**Indexes:**

| Index | Fields | Use |
|---|---|---|
| `by_note` | `[noteId]` | Look up all share records for a note |
| `by_token` | `[token]` | Resolve a share URL token to its note and permissions |
| `by_owner` | `[ownerId]` | Fetch all share links created by a user |

---

### presence

Records real-time cursor presence for collaborative editing. Rows are ephemeral — stale entries (older than 30 seconds) are ignored by the client and periodically cleaned up.

| Field | Type | Description |
|---|---|---|
| `noteId` | id("notes") | The note the user is currently viewing |
| `userId` | string | Clerk user ID |
| `userName` | string | Display name shown in the presence avatar |
| `userImageUrl` | string? | Profile image URL for the presence avatar |
| `lastSeen` | number | Unix timestamp (ms) of the user's last heartbeat — records older than 30s are treated as offline |

**Indexes:**

| Index | Fields | Use |
|---|---|---|
| `by_note` | `[noteId]` | Fetch all active users on a given note |
| `by_user_note` | `[userId, noteId]` | Upsert a user's presence record for a specific note |

---

## AI Agent Architecture

Every AI feature routes through a single streaming agent implementation in `/agents/command-agent.ts`. There is no agent framework — just direct OpenAI streaming calls with tightly scoped system prompts.

### The 14 Commands

Each command maps to a dedicated system prompt in the `SYSTEM_PROMPTS` record. The prompts are intentionally narrow: they specify exact output format, length, and tone. This keeps output consistent and latency low.

Commands are typed as a union: `table | diagram | explain | brainstorm | outline | compress | punch | counter | sowhat | assume | question | premortem | brief | research`

### WEB_COMMANDS

Four commands fetch live web context via Tavily before generation: `explain`, `table`, `diagram`, `research`.

Flow for WEB_COMMANDS:
1. Call `getWebContext(topic)` — fetches up to 3 Tavily search results
2. Append the results to the system prompt as `\n\nWeb context:\n{results}`
3. Then call OpenAI with the enriched prompt

If Tavily fails (network error, bad key), the error is silently caught and generation proceeds without web context.

### Token Limits

Each command has a configured `max_tokens` value to control cost and response length:

| Command | Max tokens |
|---|---|
| `table` | 600 |
| `brainstorm` | 500 |
| `outline` | 500 |
| `research` | 500 |
| `brief` | 450 |
| `explain` | 400 |
| `punch` | 400 |
| `premortem` | 400 |
| `diagram` | 400 |
| `assume` | 350 |
| `counter` | 300 |
| `question` | 250 |
| `compress` | 200 |
| `sowhat` | 200 |

Default fallback for unlisted commands: 500 tokens.

### Streaming and Error Handling

- All responses stream via `ReadableStream<Uint8Array>` with a `TextEncoder`
- 30-second hard timeout: if the stream has not closed, a sentinel message is enqueued and the stream is closed
- Rate limit errors from OpenAI are caught and returned as a human-readable sentinel: `[Rate limited. Please wait a moment and try again.]`
- All other errors return: `[AI unavailable. Please try again.]`
- Sentinels are encoded inline in the stream — the client can detect them by prefix

---

## Key Design Decisions

### Why Convex over Firebase or Supabase

Convex provides real-time subscriptions, serverless functions, and end-to-end TypeScript types in a single integrated system. With Firebase or Supabase you build and maintain a separate backend layer (Cloud Functions / Edge Functions) alongside the database. With Convex, the database and the functions that operate on it are co-located, type-safe, and deployed together. No ORM, no API layer, no schema migration files.

### Why GPT-4o mini

Fast, cheap, and accurate enough for structured generation tasks (tables, outlines, explanations). The 14 command prompts are designed around its capabilities — narrow scope, explicit format instructions, modest token limits. Swapping to GPT-4o is a one-line change in `command-agent.ts` for any command that needs higher quality at higher cost.

### Why Clerk

Clerk provides production-quality auth (social login, magic link, MFA, session management) with zero custom auth code to maintain. The alternative — building auth with NextAuth or a custom JWT flow — adds hundreds of lines of security-critical code that must be maintained forever. Clerk's Next.js SDK integrates with the App Router middleware in under 10 lines.

### Why BlockNote

BlockNote is the only block-based rich text editor with a clean, idiomatic React API that does not require ProseMirror expertise to customize. Tiptap (the next closest option) requires direct ProseMirror schema manipulation for any non-trivial extension. BlockNote exposes a typed block model that maps cleanly to the `content` field in the `notes` table — blocks serialize to JSON and deserialize without data loss.
