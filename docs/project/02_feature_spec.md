# 02 Feature Spec

## Core Features

### 1. Note Editor
**What it does**: Rich block-based note editing powered by BlockNote with real-time autosave via Convex.
**Key behaviors**: Auto-saves on every change (800ms debounce). Supports heading blocks (H1/H2/H3), paragraphs, lists. Emoji icon per note. Title input with large font. Tag input with add/remove. Sub-notes (2-level hierarchy). Linked notes with backlink tracking. Version history. Markdown export. Undo/redo.
**States**: Loading (spinner), note not found (error state with back button), saving (animated dot), saved (transient "Saved" label).

### 2. AI Slash Commands
**What it does**: 14 AI-powered commands triggered by typing `/` at the start of a line or via the `/AI` button in the top bar.
**Commands**: table, diagram, explain, brainstorm, outline, research, compress, punch, counter, sowhat, assume, question, premortem, brief.
**Web commands** (fetch live context via Tavily first): explain, table, diagram, research.
**Key behaviors**: Commands stream directly into the editor as a new block. AI blocks are marked with a left blue border. Rate limited to 20 requests/min per user. 30-second hard timeout.
**States**: Command menu visible (slash typed), input phase (topic entry), streaming (live text), inserted.

### 3. Tab Autocomplete
**What it does**: Context-aware sentence/phrase completion triggered by Tab key.
**Key behaviors**: Detects last 5 words before cursor as context. Calls /api/ai/autocomplete. Streams result as a ghost overlay. Tab again to accept, Escape to dismiss. Rate limited to 30/min per user.
**States**: Ghost text overlay, streaming, accepted, dismissed.

### 4. Dashboard
**What it does**: Home surface showing notes, quick AI actions, and tag clusters.
**Key behaviors**: My Notes card carousel (filtered by Today/This Week/This Month). Horizontal scroll cards with pastel colored headers. Quick Start AI action row (personalized by role). Tags as folder icons. Empty state with brainstorm input.
**States**: Loading (skeleton cards), empty (quick-start prompt), populated (card carousel + tags).

### 5. Sidebar (Desktop) / Bottom Nav (Mobile)
**What it does**: Global navigation for the authenticated app shell.
**Desktop behaviors**: Spring-animated overlay. Logo, primary nav (Dashboard, Settings), New Note button, search (>4 notes), tag filter, notes list, user menu.
**Mobile behaviors**: Fixed bottom nav (Home, Notes, New, AI). Sidebar opens as overlay.
**States**: Open, closed, note active (highlight in list).

### 6. Search (Cmd+K)
**What it does**: Full-text search across all notes by title.
**Key behaviors**: Opens on Cmd+K. Debounced search via Convex searchIndex. Navigates to selected note. Closes on Escape or click-outside.
**States**: Empty query (show recent), results, no results.

### 7. Sharing
**What it does**: Generate share links for individual notes with view or edit permissions.
**Key behaviors**: Owner creates token via share panel. Share link: `/shared/[token]`. View permission: read-only. Edit permission: full editor. Collaborator list updated on access. Link can expire.
**States**: Not shared, share link active, collaborator count shown.

### 8. Collaborative Presence
**What it does**: Show who else is currently viewing the same note.
**Key behaviors**: Presence heartbeat every 10 seconds via Convex mutation. Avatars shown in top bar. Stale presence (>30s) excluded. Max 5 avatars shown.

### 9. Version History
**What it does**: Saved snapshots of note content over time.
**Key behaviors**: Auto-snapshot on save (throttled). Accessible from overflow menu. Restore to previous version.

### 10. Settings
**What it does**: User profile and app preferences management.
**Sections**: Profile (name, email — display from Clerk), Preferences (role, use cases from onboarding), Account (sign out, delete data).
**Route pattern**: /settings → /settings/profile, /settings/preferences, /settings/account.

## Feature Priority (v1)
| Feature | Status |
|---|---|
| Note Editor | ✅ Complete |
| AI Slash Commands | ✅ Complete |
| Tab Autocomplete | ✅ Complete |
| Dashboard | ✅ Complete |
| Sidebar / Bottom Nav | ✅ Complete |
| Search | ✅ Complete |
| Sharing | ✅ Complete |
| Collaborative Presence | ✅ Complete |
| Version History | ✅ Complete |
| Settings | 🔧 In Progress |
| Admin Panel | ❌ Not in v1 |
| Billing | ❌ Not in v1 |
