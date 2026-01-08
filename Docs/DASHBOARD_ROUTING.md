# Dashboard Routing Architecture

## Overview

The dashboard serves as the **authenticated user's home base** - a central hub where users choose what to do next. It does NOT use user-specific UIDs in the URL because the user context is handled by authentication.

## Why Dashboard Doesn't Need `/dashboard/[uid]`

### ✅ Correct Pattern: `/dashboard`
- Dashboard is a **personal space**, not a shareable resource
- User identity is determined by **authentication session**, not URL
- Every user sees their own dashboard at the same URL
- Middleware handles auth and automatically scopes data to the logged-in user

### ❌ Incorrect Pattern: `/dashboard/[uid]`
- Would imply dashboards are shareable resources (they're not)
- Adds unnecessary complexity
- Security risk: could allow URL manipulation to view others' data
- Not RESTful for this use case

## Routing Structure

```
/                           → Landing page (marketing)
/login                      → Authentication
/dashboard                  → User's home hub (choose studio/action)
  ├── /billing              → Subscription & usage management
  └── /settings             → Account settings (profile, account, preferences)

/studio                     → Active workspace (when working on projects)
  ├── /projects             → Project list
  ├── /projects/[id]        → Specific project (NEEDS UID - shareable resource)
  │   └── /pages/[pageId]   → Specific page in project
  ├── /library/heroes       → Hero character library
  │   └── /new              → Create new hero
  └── /settings             → Studio-specific settings (redirects to dashboard)
```

## When to Use UIDs in URLs

### ✅ Use UIDs for:
1. **Projects** - `/studio/projects/[id]`
   - Users can have multiple projects
   - Projects need unique identifiers
   - May want to share/bookmark specific projects

2. **Pages** - `/studio/projects/[id]/pages/[pageId]`
   - Individual pages within a project
   - Need direct linking for editing

3. **Heroes** - `/studio/library/heroes/[id]`
   - Reusable character references
   - May be used across multiple projects

### ❌ Don't Use UIDs for:
1. **Dashboard** - It's the user's personal hub
2. **Settings** - User-scoped, not a resource
3. **Billing** - User-scoped, not a resource
4. **Library views** - List pages don't need UIDs

## User Flow Examples

### First-time user:
```
/login → /dashboard → Click "Coloring Book Studio" → /studio → /studio/projects/new
```

### Returning user:
```
/login → /dashboard → Click "Coloring Book Studio" → /studio/projects → /studio/projects/[id]
```

### Checking billing:
```
/dashboard → Click blot balance → /dashboard/billing
```

### Managing account:
```
/dashboard → Click "Settings" card → /dashboard/settings?tab=profile
```

## Security Model

- **Authentication**: Handled by middleware + Supabase Auth
- **Authorization**: Row Level Security (RLS) policies in Supabase
- **User Scoping**: All queries automatically filtered by `auth.uid()`
- **No URL manipulation risk**: Even if someone tries `/dashboard`, they only see their own data

## Benefits of This Structure

1. **Clear mental model**: Dashboard = hub, Studio = workspace
2. **SEO friendly**: Clean URLs without unnecessary IDs
3. **Secure by default**: Auth handled at middleware level
4. **Scalable**: Easy to add new studio types or features
5. **Bookmarkable**: Specific resources (projects/pages) have stable URLs

## Future Considerations

If you add new studio types (e.g., "Book Cover Creator"), follow the same pattern:

```
/dashboard                  → Hub (choose any studio)
  → Coloring Book Studio    → /studio/projects/[id]
  → Book Cover Creator      → /book-covers/projects/[id]
  → Monochrome Maker        → /monochrome/projects/[id]
```

Each studio type gets its own namespace, but dashboard remains the central hub without UIDs.
