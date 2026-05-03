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
