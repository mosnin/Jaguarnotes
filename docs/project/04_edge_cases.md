# 04 Edge Cases

## Auth & Session

- User's Clerk session expires mid-editing: Autosave catches a 401 → redirects to `/sign-in` with redirect URL preserved
- User opens two tabs with same note: Both receive real-time updates via Convex subscription; last write wins on autosave
- User signs up but skips onboarding: `/dashboard` checks `onboarded` flag; if false, redirects to `/onboarding`

## Note Editor

- Note is deleted by user in another tab: Editor detects `note === null` from Convex query → shows "Note deleted" state with back button
- Very long note (100+ blocks): Editor handles via virtual scrolling (BlockNote default); autosave sends full JSON each time
- Empty note (no content, no title): Remains in database. Dashboard shows "Untitled" with "No content yet" preview
- Note with only whitespace title: Stored as-is; displayed as "Untitled" in UI. Autosave fires normally
- AI command timeout (>30s): Stream closes with sentinel message `[AI unavailable. Please try again.]` inserted as text in editor
- AI rate limit hit: Sentinel message `[Rate limited. Please wait a moment and try again.]` shown inline
- Tavily search fails for web commands: Error silently caught; AI proceeds without web context
- Autocomplete while another autocomplete is pending: Second Tab press dismissed; only one overlay shown at a time
- Paste large content block: BlockNote handles; autosave fires within 800ms

## Dashboard

- User has 0 notes: Empty state shown with brainstorm input
- User has notes but none match time filter: Carousel shows only the "New note" dashed card
- User has >20 notes: Pagination via `paginateNotes` with "Load more" button
- Tag has only 1 note: Still shown as folder icon (count shown below)
- Long tag name: Truncated at 2 characters for abbreviation, full name truncated with CSS

## AI Commands

- Invalid command name in URL param: `/api/ai/command` returns 400; editor shows error toast
- OpenAI API key missing: Returns 500; editor shows error toast "AI unavailable"
- User triggers command on empty topic: Input validation prevents submission (button disabled when topic is empty)
- Slash command menu open when user navigates away: Menu dismissed via component unmount

## Sharing

- Share token is invalid or expired: `/shared/[token]` shows "This link is invalid or has expired" with link to sign in
- Note owner deletes note while share link is active: Shared page shows "Note deleted" error state
- Collaborator attempts to edit a view-only note: Editor renders in read-only mode; no edit controls shown
- Share link accessed without login (view-only): Page loads without requiring auth

## Real-time Sync

- Convex subscription disconnects: Convex client auto-reconnects; stale data shown with no error (Convex handles internally)
- Presence heartbeat fails: User's presence record becomes stale (>30s) and is filtered out by client
- Two users save simultaneously: Convex handles last-write-wins at mutation level; no data corruption

## Mobile

- User on iOS Safari with PWA installed: `overflow-x: hidden` prevents horizontal sliding. Bottom nav shows with safe-area-inset-bottom padding
- Bottom nav overlaps content: Main content has `pb-16` to clear the nav
- Keyboard appears on mobile during editing: Mobile browser resizes viewport; editor scrolls to cursor

## Performance

- Dashboard with many notes: `paginateNotes` limits initial load to 20; subsequent pages loaded on demand
- Large AI response (table command, 600 tokens): Streamed incrementally; editor handles appending chunks
- User navigates rapidly between notes: Each note page uses Convex `useQuery` which caches per noteId
