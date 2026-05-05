# 07 Acceptance Criteria

## Auth

- [ ] User can sign up with email/password via Clerk
- [ ] User can sign in and is redirected to `/dashboard` or the originally requested page
- [ ] Unauthenticated requests to protected routes redirect to `/sign-in`
- [ ] Session expiry during note editing redirects to `/sign-in` (autosave catches the 401)

## Onboarding

- [ ] New user is redirected to `/onboarding` on first login (before dashboard)
- [ ] Onboarding has at minimum role selection and use case selection steps
- [ ] User can skip onboarding after step 1
- [ ] On completion, `users.onboarded` is set to `true` and user is redirected to `/dashboard`
- [ ] Returning user with `onboarded: true` is not shown onboarding again

## Note Editor

- [ ] New note is created and user is navigated to `/notes/[id]`
- [ ] Title field is large, keyboard-focused, and saves on change
- [ ] Content saves automatically within 1 second of last keystroke (no manual save required)
- [ ] "Saved" indicator appears briefly after save
- [ ] Emoji icon can be set and is shown in sidebar and dashboard cards
- [ ] Tags can be added (Enter or comma) and removed (× button)
- [ ] Note with no content shows AIWelcome panel
- [ ] Note with content shows BlockNote editor immediately
- [ ] Undo (Cmd+Z) and redo (Cmd+Y) work inside the editor
- [ ] Markdown export downloads a `.md` file with the correct content

## AI Commands

- [ ] Typing `/` at start of line or after space opens slash command menu
- [ ] All 14 commands are available in the menu
- [ ] Command executes and content streams into the editor
- [ ] AI-generated blocks are marked with a blue left border
- [ ] Rate limit (20/min) is enforced; user sees friendly message if exceeded
- [ ] AI commands work on mobile
- [ ] `/AI` button in top bar opens slash command menu

## Tab Autocomplete

- [ ] Tab key with 2+ words before cursor triggers autocomplete overlay
- [ ] Ghost text appears above/beside the cursor
- [ ] Tab again accepts the suggestion
- [ ] Escape dismisses the suggestion
- [ ] Rate limit (30/min) is enforced

## Dashboard

- [ ] Dashboard shows "My Notes" card carousel
- [ ] Cards are filterable by Today / This Week / This Month
- [ ] Each card shows note title, time, and preview lines
- [ ] Quick Start section shows AI actions personalized to user role
- [ ] Tags section shows folder icons (when tags exist with 2+ notes)
- [ ] Empty state shows brainstorm input (when 0 notes)
- [ ] "Load more" works when >20 notes

## Search (Cmd+K)

- [ ] Cmd+K opens search modal
- [ ] Typing searches note titles in real time
- [ ] Clicking a result navigates to the note
- [ ] Escape closes the modal

## Settings

- [ ] `/settings` redirects to `/settings/profile`
- [ ] Profile page shows name and email from Clerk
- [ ] Preferences page shows role and use cases (editable)
- [ ] Account page has sign out button and delete data danger zone
- [ ] Settings link is accessible from the sidebar

## Sharing

- [ ] Share panel accessible from overflow menu
- [ ] View and edit permission levels available
- [ ] Generated share link works without login (view-only) or with login (edit)
- [ ] Invalid/expired token shows proper error state

## Mobile

- [ ] Bottom nav is visible and functional on mobile
- [ ] Page does not slide horizontally on mobile
- [ ] Editor is fully functional on mobile
- [ ] AI commands work on mobile

## Performance

- [ ] Dashboard loads in under 1 second
- [ ] AI command starts streaming within 2 seconds
- [ ] Autosave does not cause visible UI jank
