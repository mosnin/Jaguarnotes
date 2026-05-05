# 03 User Flows

## Flow 1: New User Signup → First AI Note

1. User lands on `/` (landing page)
2. Clicks "Get started free" → redirected to `/sign-up` (Clerk)
3. Completes email signup → Clerk redirects to `/onboarding`
4. Onboarding Step 1: Select role (researcher/founder/writer/student/other)
5. Onboarding Step 2: Select use cases (multi-select checkboxes)
6. Onboarding completes → redirect to `/dashboard`
7. Dashboard shows empty state with brainstorm input
8. User types topic in input → presses Enter
9. New note created → redirected to `/notes/[id]?cmd=brainstorm&topic=...`
10. AI brainstorm auto-triggers → content streams into editor
11. **First value event achieved**

## Flow 2: Returning User → New Note with Slash Command

1. User logs in → `/dashboard`
2. Clicks "New note" (Quick Start section or top of card carousel)
3. Redirected to `/notes/[id]` (new empty note)
4. AIWelcome panel shows (first time) or editor is ready
5. User types title in title field
6. Types `/` in editor → slash command menu appears
7. Selects command (e.g. brainstorm) → enters topic
8. AI content streams into editor as a blue-bordered block
9. User continues writing; note auto-saves
10. Returns to `/dashboard`

## Flow 3: Browse and Find a Note

1. User is on `/dashboard`
2. Sees card carousel filtered by "This Week"
3. Clicks a note card → navigated to `/notes/[id]`
4. OR: Presses Cmd+K → search modal opens
5. Types note title → results appear
6. Clicks result → navigated to note

## Flow 4: Share a Note

1. User is editing a note at `/notes/[id]`
2. Clicks `···` overflow menu
3. Clicks "Share note"
4. Share panel opens
5. Selects permission level (view/edit)
6. Clicks "Generate link"
7. Share token created → link copied to clipboard
8. Shares link with recipient
9. Recipient opens `/shared/[token]` → sees note in view or edit mode

## Flow 5: Settings Update

1. User opens sidebar
2. Clicks Settings (bottom of sidebar nav)
3. Navigated to `/settings/profile`
4. Settings layout shows left sidebar with section links
5. Views profile info (from Clerk)
6. Clicks "Preferences" → updates role or use cases
7. Clicks "Account" → sees sign out and danger zone

## Flow 6: Tab Autocomplete

1. User is typing in the note editor
2. Pauses after 2+ words
3. Presses Tab → autocomplete overlay appears with ghost text
4. Reads the suggestion
5. Presses Tab again to accept → ghost text inserted as real text
6. OR presses Escape → suggestion dismissed

## Flow 7: Link Two Notes

1. User is editing a note
2. Clicks `···` overflow menu → "Link another note"
3. Note link picker opens
4. Types to search existing notes
5. Clicks a note → link inserted as a block, backlink recorded on target note
6. "Links to" section appears in Connections panel at bottom of note
