# 05 Tech Stack

## Project Constraint

Jaguarnotes uses **Convex** for all data persistence and real-time sync. The framework default of Prisma/PostgreSQL does not apply. All framework patterns referencing Prisma, Supabase, or SQL should be adapted to Convex equivalents. Auth.js is replaced by Clerk.

## Core Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | TypeScript, server/client components |
| Styling | Tailwind CSS v4 | `@import "tailwindcss"` directive, @theme block |
| UI | Hand-rolled neumorphic components | White/light-blue design system; no shadcn/ui |
| Animation | Framer Motion | Page transitions, sidebar spring, stagger |
| Database | Convex | Real-time subscriptions, serverless functions, schema in `/convex/schema.ts` |
| Auth | Clerk | Sessions, user management, `@clerk/nextjs` |
| AI | OpenAI GPT-4o mini | `/api/ai/command` and `/api/ai/autocomplete` routes |
| Web Search | Tavily | Context enrichment for 4 AI commands |
| Rich Text | BlockNote + Mantine | `@blocknote/react`, `@blocknote/mantine`, `@blocknote/core` |
| Hosting | Vercel | Production deployment |
| Icons | Custom SVG + Huge Icons | `@hugeicons/react` — stroke for nav, solid for active |

## Data Layer (Convex)

Convex replaces Prisma/PostgreSQL throughout. Key patterns:

- **Queries**: `useQuery(api.notes.list)` for real-time subscriptions
- **Paginated queries**: `usePaginatedQuery(api.notes.paginateNotes, {}, { initialNumItems: 20 })`
- **Mutations**: `useMutation(api.notes.create)` — called from client components
- **Actions**: `api.ai.*` — for server-side AI calls (not used currently; AI runs via Next.js API routes)
- **Schema**: `/convex/schema.ts` — `defineSchema`, `defineTable`, validators
- **Auth verification**: Convex auth reads Clerk JWT; functions call `ctx.auth.getUserIdentity()`
- **Indexes**: Defined in schema; queried via `.withIndex("by_user", (q) => q.eq("userId", identity.subject))`

Tables: `notes`, `users`, `shares`, `presence`, `rateLimits`, `collaboratorNotes`, `noteVersions`

## Auth (Clerk)

Clerk replaces Auth.js. Key patterns:

- **Middleware**: `middleware.ts` using `clerkMiddleware()` from `@clerk/nextjs/server`
- **Server-side auth**: `auth()` from `@clerk/nextjs/server` in Server Components and API Routes
- **Client-side auth**: `useUser()`, `useAuth()` from `@clerk/nextjs`
- **UI**: `<UserButton>` for user menu, `<ClerkProvider>` wraps root layout
- **Sign in/up pages**: `/app/(auth)/sign-in/page.tsx`, `/app/(auth)/sign-up/page.tsx`
- **Appearance**: Clerk appearance API with `colorPrimary: '#2563EB'`, `colorBackground: '#EDF4FF'`

## AI Layer

- **API routes**: `/api/ai/command` (POST, streaming), `/api/ai/autocomplete` (POST, streaming)
- **Agent file**: `/agents/command-agent.ts` — streaming OpenAI calls with system prompts per command
- **Rate limiting**: Convex `rateLimits` table; sliding window 20 req/min (commands), 30 req/min (autocomplete)
- **Web context**: Tavily API called for 4 commands; result appended to system prompt

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL (client) |
| `CONVEX_DEPLOY_KEY` | Convex deploy key (CI/CD) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `OPENAI_API_KEY` | OpenAI API key |
| `TAVILY_API_KEY` | Tavily web search key |

## Build Command

```
if [ "$VERCEL_ENV" = "production" ]; then
  convex deploy --cmd 'next build'
else
  NEXT_PUBLIC_CONVEX_URL=https://curious-retriever-30.convex.cloud next build
fi
```

Production Convex deployment: `https://curious-retriever-30.convex.cloud`
