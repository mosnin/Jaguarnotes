# 06 Permissions Matrix

## Roles

Jaguarnotes v1 has two access levels (not roles):

| Level | Description |
|---|---|
| **Authenticated** | Signed-in user via Clerk |
| **Share recipient** | Accessed note via share token (no account required for view-only) |

No multi-tenant organizations in v1. All data is per-user.

## Route Permissions

| Route | Authenticated | Share Token | Unauthenticated |
|---|---|---|---|
| `/` | Redirect → `/dashboard` | — | ✅ View landing |
| `/sign-in` | Redirect → `/dashboard` | — | ✅ View |
| `/sign-up` | Redirect → `/dashboard` | — | ✅ View |
| `/onboarding` | ✅ Access | — | Redirect → `/sign-in` |
| `/dashboard` | ✅ Access | — | Redirect → `/sign-in` |
| `/notes/[id]` | ✅ Own notes only | — | Redirect → `/sign-in` |
| `/settings/*` | ✅ Access | — | Redirect → `/sign-in` |
| `/shared/[token]` | ✅ Access (respects permission) | ✅ View-only or edit | ✅ View-only |

## Data Permissions

| Action | Rule |
|---|---|
| Read note | `note.userId === currentUser.clerkId` OR valid share token |
| Create note | Must be authenticated |
| Update note | `note.userId === currentUser.clerkId` OR share token with `permission === "edit"` |
| Delete note | `note.userId === currentUser.clerkId` only |
| Pin note | `note.userId === currentUser.clerkId` only |
| Create share token | `note.userId === currentUser.clerkId` only |
| Revoke share token | `share.ownerId === currentUser.clerkId` only |
| View share token list | `share.ownerId === currentUser.clerkId` only |
| Execute AI commands | Must be authenticated (rate limited per userId) |
| Read presence | Must be authenticated and have access to note |
| Write presence | Must be authenticated and have access to note |

## Enforcement Points

All Convex queries and mutations verify identity via `ctx.auth.getUserIdentity()`. API routes (`/api/ai/*`) verify Clerk session server-side before processing. Share token access bypasses Clerk auth check but is validated against the `shares` table.

No admin routes or admin roles in v1.
