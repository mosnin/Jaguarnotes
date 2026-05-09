# 08 QA Checklist

## Auth Flow
- [ ] Sign up with new email creates user and redirects to onboarding
- [ ] Sign in with existing account redirects to dashboard
- [ ] Sign in with wrong password shows inline Clerk error
- [ ] Accessing `/dashboard` while logged out redirects to `/sign-in`
- [ ] After sign-in, redirect to originally requested page

## Onboarding
- [ ] Role selection required before advancing
- [ ] Use case selection optional (skip available)
- [ ] Completing onboarding sets `onboarded: true` in Convex
- [ ] Re-visiting `/onboarding` when already onboarded redirects to dashboard

## Note CRUD
- [ ] Create note → navigates to `/notes/[id]`
- [ ] Title saves on blur and on change (debounced)
- [ ] Content saves automatically (no manual save)
- [ ] Delete note → returns to dashboard
- [ ] Deleted note URL shows "not found" error state
- [ ] Pin/unpin note persists across refresh

## AI Commands
- [ ] All 14 commands produce output
- [ ] Web commands (explain, table, diagram, research) include live search context
- [ ] Rate limit enforced (20/min) — 21st request shows friendly error
- [ ] 30s timeout produces sentinel message, not blank
- [ ] AI block border appears on generated content
- [ ] Works while offline shows error toast

## Dashboard
- [ ] Time filter changes card set correctly
- [ ] Tag folders only appear when 2+ notes share a tag (or as configured)
- [ ] New note card appears at end of carousel
- [ ] Quick Start buttons create notes and trigger correct AI command
- [ ] Load more appends to list

## Search
- [ ] Cmd+K opens modal
- [ ] Search by partial title finds notes
- [ ] Click result navigates
- [ ] Escape closes
- [ ] Empty query shows recent notes (or empty state)

## Editor UI
- [ ] Emoji picker opens/closes correctly
- [ ] Tag input: Enter adds tag, Backspace removes last tag when input empty
- [ ] Sub-notes create and link correctly
- [ ] Linked notes appear in Connections panel
- [ ] Version history accessible from overflow menu
- [ ] Markdown export downloads `.md` file

## Settings
- [ ] `/settings` redirects to `/settings/profile`
- [ ] Left sidebar highlights active section
- [ ] Profile shows correct name + email from Clerk
- [ ] Preferences save updates Convex `users` record
- [ ] Sign out logs user out and returns to `/`

## Sharing
- [ ] Generate share link for view permission → opens without login
- [ ] Generate share link for edit permission → requires login
- [ ] Invalid token shows proper error
- [ ] Owner can revoke share link

## Mobile (375px viewport)
- [ ] Bottom nav visible, all 4 taps work
- [ ] Sidebar opens as overlay, closes on backdrop tap
- [ ] Editor types without layout shift
- [ ] AI commands accessible via bottom nav AI tab
- [ ] No horizontal scrollbar or layout overflow

## Responsive Checkpoints
- [ ] 375px (iPhone SE) — fully functional
- [ ] 768px (iPad portrait) — bottom nav hidden, sidebar present
- [ ] 1024px (iPad landscape) — desktop layout
- [ ] 1280px (laptop) — full desktop layout

## Error States
- [ ] Note 404 → error state with back button (not blank page)
- [ ] AI error → inline toast, not white screen
- [ ] Network failure during save → toast warning + retry
- [ ] Convex disconnected → auto-reconnects (no user action needed)
- [ ] Share token invalid → proper error page

## Accessibility
- [ ] Keyboard navigation works in search modal
- [ ] Focus rings visible on all interactive elements
- [ ] Sidebar close button has aria-label
- [ ] Editor keyboard shortcuts documented in shortcuts modal (?)
- [ ] Color contrast passes WCAG AA (navy #1B3652 on #EDF4FF)
