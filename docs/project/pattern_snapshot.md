# Pattern Snapshot — Jaguarnotes

> Generated at Phase 7 completion. Read this before writing any code in Phase 8+.
> Version: 1 | Last updated: 2026-05-05

---

## A. Project Structure

```
/app
  layout.tsx                    # Root layout — ClerkProvider, ConvexClientProvider, fonts
  globals.css                   # Tailwind v4 @theme, neumorphic CSS utilities
  page.tsx                      # Landing page (public, unauthenticated)
  (auth)/
    layout.tsx                  # Auth layout — light blue bg, no sidebar
    sign-in/page.tsx            # Clerk SignIn component with custom appearance
    sign-up/page.tsx            # Clerk SignUp component with custom appearance
  (app)/
    layout.tsx                  # App shell — SidebarProvider, AppShell (sidebar + backdrop + bottom nav)
    dashboard/page.tsx          # Dashboard — card carousel, Quick Start, tag folders
    notes/[id]/page.tsx         # Note editor page — wraps NoteEditor component
    settings/
      layout.tsx                # Settings shell — left sidebar nav + right content
      page.tsx                  # Redirect → /settings/profile
      profile/page.tsx          # Profile settings
      preferences/page.tsx      # Preferences (role, use cases)
      account/page.tsx          # Account (sign out, danger zone)
  onboarding/page.tsx           # Multi-step onboarding (role → use cases → done)
  shared/[token]/page.tsx       # Public share view/edit

/components
  app/
    sidebar.tsx                 # Animated overlay sidebar with notes list + nav
    sidebar-context.tsx         # useSidebar() hook — open/setOpen/toggle
    bottom-nav.tsx              # Mobile bottom nav (Home/Notes/New/AI)
    search-modal.tsx            # Cmd+K search overlay
  editor/
    note-editor.tsx             # Full note editor component (BlockNote + AI overlays)
    ai-autocomplete-overlay.tsx # Tab autocomplete ghost text
    ai-welcome.tsx              # First-time empty note AI prompt panel
    slash-command-menu.tsx      # /command input + streaming result panel
    selection-toolbar.tsx       # Text selection → AI command shortcut
    note-link-picker.tsx        # Link another note picker
    overflow-menu.tsx           # ··· menu (pin, link, share, export, delete)
    share-panel.tsx             # Share link generation panel
    presence-avatars.tsx        # Real-time collaborator avatars in top bar
  landing/
    animated-demo.tsx           # Hero section animated demo
  providers/
    convex-client-provider.tsx  # ConvexClientProvider + ClerkProvider bridge
    neumorphism-theme.tsx       # Theme provider (no-op; theme defined in CSS)
  ui/
    button.tsx                  # Button component (primary, secondary, ghost, danger variants)
    logo.tsx                    # Logo component — next/image with /logo.png
    toast.tsx                   # Toast component + useToast hook
    note-card-skeleton.tsx      # Loading skeleton for dashboard note cards
    shortcuts-modal.tsx         # ? keyboard shortcut overlay
    error-boundary.tsx          # React error boundary

/convex
  schema.ts                     # Convex schema — notes, users, shares, presence, rateLimits, etc.
  notes.ts                      # Note CRUD queries/mutations/paginated query
  users.ts                      # User getMe query, upsertUser mutation
  shares.ts                     # Share token create/revoke/validate
  presence.ts                   # Presence heartbeat/query
  rateLimits.ts                 # Rate limit check mutation
  noteVersions.ts               # Version create/list/restore mutations

/agents
  command-agent.ts              # OpenAI streaming agent — 14 commands with system prompts

/lib
  utils.ts                      # formatDistanceToNow, cn()
  motion.ts                     # Framer Motion variants (fadeUp, slideLeft, staggerContainer, etc.)
  toast.ts                      # toast.success/error/info helpers
  blocks.ts                     # blocksToMarkdown utility
  telemetry.ts                  # trackError utility

/app/api
  ai/command/route.ts           # POST /api/ai/command — streaming AI slash commands
  ai/autocomplete/route.ts      # POST /api/ai/autocomplete — streaming Tab autocomplete
```

---

## B. Import Path Map

```typescript
// Convex
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useQuery, useMutation, usePaginatedQuery } from "convex/react"

// Auth
import { useUser, UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"

// App shell
import { useSidebar } from "@/components/app/sidebar-context"
import { Logo } from "@/components/ui/logo"

// Motion variants
import { staggerContainer, staggerItem, cardHover, buttonTap, slideLeft, fadeUp } from "@/lib/motion"

// UI primitives
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"

// Neumorphic CSS classes (globals.css utilities)
// neu-card   — raised card shadow
// neu-raised — slightly raised surface
// neu-sm     — small raised shadow
// neu-pressed / neu-inset — sunken input shadow
// neu-btn    — interactive button shadow with hover/active states
```

---

## C. Convex Query Patterns

```typescript
// Basic query (real-time subscription)
const notes = useQuery(api.notes.list) ?? []

// Paginated query
const { results, status, loadMore } = usePaginatedQuery(
  api.notes.paginateNotes as any,
  {},
  { initialNumItems: 20 }
)

// Conditional query (skip when no data)
const note = useQuery(
  api.notes.get,
  noteId ? { id: noteId as Id<"notes"> } : "skip"
)

// Mutation
const createNote = useMutation(api.notes.create)
const id = await createNote({ title: "Untitled" })

// Mutation in Convex function (server-side, scoped by userId)
const identity = await ctx.auth.getUserIdentity()
if (!identity) throw new Error("Unauthenticated")
const userId = identity.subject
const notes = await ctx.db
  .query("notes")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .collect()
```

---

## D. Component Usage Patterns

### Page wrapper (authenticated app page)
```tsx
export default function MyPage() {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Top bar */}
      <div className="flex h-10 shrink-0 items-center justify-between px-6 md:px-8">
        <button onClick={toggleSidebar} className="flex h-7 w-7 items-center justify-center rounded-md text-ink-4 hover:bg-raised hover:text-ink-2" aria-label="Toggle sidebar">
          {/* hamburger SVG */}
        </button>
        <kbd className="hidden md:block ...">⌘K search</kbd>
      </div>
      {/* Content */}
      <div className="flex-1 px-6 pb-16 pt-6 md:px-8 md:pt-10">
        {/* page content */}
      </div>
    </div>
  )
}
```

### Note card (neumorphic)
```tsx
<motion.button
  variants={staggerItem}
  onClick={onClick}
  className="relative flex h-52 w-44 shrink-0 flex-col overflow-hidden rounded-2xl text-left transition-all hover:-translate-y-0.5 neu-card"
>
  {/* colored header band */}
  <div className="..." style={{ background: color.bg, borderBottom: `1px solid ${color.border}` }}>
    <p className="truncate text-[13px] font-semibold text-ink-1">{title}</p>
  </div>
  {/* preview */}
  <div className="flex-1 px-3.5 py-2.5">
    <p className="truncate text-[11px] text-ink-3">{preview}</p>
  </div>
</motion.button>
```

### Section heading pattern
```tsx
<h2 className="text-base font-semibold text-ink-1">Section Title</h2>
```

### Loading state (inline skeleton)
```tsx
{status === "LoadingFirstPage" && (
  <div className="flex gap-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="h-52 w-44 shrink-0 rounded-2xl bg-line-1 animate-pulse" />
    ))}
  </div>
)}
```

### Empty state
```tsx
<div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
  <p className="text-sm text-ink-3">No notes yet.</p>
  <button onClick={handleNew} className="rounded-lg px-4 py-2 text-sm text-ai border border-ai/30 hover:bg-ai-dim transition-colors">
    Create your first note
  </button>
</div>
```

### Error state
```tsx
<div className="flex h-full flex-col items-center justify-center gap-3 text-center">
  <p className="text-sm text-ink-3">Something went wrong.</p>
  <button onClick={() => router.push("/dashboard")} className="rounded-lg bg-raised px-4 py-2 text-sm text-ink-2 hover:bg-hover hover:text-ink-1">
    Back to dashboard
  </button>
</div>
```

---

## E. Design Token Reference

### Color classes (Tailwind → CSS var)
```
bg-app, bg-surface           → #EDF4FF (base background)
bg-raised                    → #F4F8FF (elevated surface)
bg-hover                     → #E2EEFF (hover state)
bg-selected                  → #D4E6FF (selected state)
border-line-1                → #D5E4F5 (faint divider)
border-line-2                → #C2D5EB (default border)
border-line-3                → #AABFD6 (strong border)
text-ink-1                   → #1B3652 (primary text, navy)
text-ink-2                   → #4A6D8C (secondary text)
text-ink-3                   → #7B9AB8 (tertiary text)
text-ink-4                   → #A8C2D8 (ghost/placeholder)
text-ai, border-ai           → #2563EB (AI accent, rich blue)
bg-ai-dim                    → rgba(37,99,235,0.12)
```

### Neumorphic shadow utilities
```
neu-card    → 4px 4px 10px #C5D5E8, -4px -4px 10px #FFFFFF + border
neu-raised  → 3px 3px 8px #C5D5E8, -3px -3px 8px #FFFFFF + border
neu-sm      → 2px 2px 5px #C5D5E8, -2px -2px 5px #FFFFFF
neu-pressed → inset shadows (sunken state)
neu-inset   → inset 2px 2px 6px / -2px -2px 6px (input fields)
neu-btn     → with transition; hover softens, active inverts
```

---

## F. File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Page components | `page.tsx` in route folder | `app/(app)/dashboard/page.tsx` |
| Layout components | `layout.tsx` in route folder | `app/(app)/layout.tsx` |
| React components | kebab-case `.tsx` | `note-card-skeleton.tsx` |
| Convex functions | kebab-case `.ts` | `notes.ts`, `note-versions.ts` |
| Utility files | kebab-case `.ts` | `utils.ts`, `motion.ts` |
| Client markers | `"use client"` at top | Required for hooks/events |

---

## G. Motion Variants (lib/motion.ts)

```typescript
staggerContainer  // parent: stagger children 0.06s
staggerItem       // child: fade + slide up 8px
cardHover         // subtle scale + translate on hover
buttonTap         // scale-down on tap
slideLeft         // sidebar spring slide (x: -100% → 0)
fadeUp            // fade + 10px slide up
springStd         // spring config: stiffness 380, damping 34
```

---

## H. Phase Status

| Phase | Status |
|---|---|
| 4 — Foundation | ✅ Complete |
| 5 — Auth | ✅ Complete (Clerk) |
| 6 — Onboarding | ✅ Complete |
| 7 — App Shell | ✅ Complete |
| 8 — Dashboard | ✅ Complete (card carousel archetype) |
| 9 — Core Features | ✅ Complete (note editor, AI commands) |
| 10 — Settings | 🔧 In Progress |
| 11 — Admin | ❌ Not in v1 |
| 12 — Email | ❌ Not in v1 |
| 13 — Marketing | ✅ Complete (landing page) |
| 14 — Polish | 🔧 Ongoing |
