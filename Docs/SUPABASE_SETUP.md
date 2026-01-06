# Supabase Setup Guide

## Overview

Supabase is used for authentication, database, and real-time features. This guide covers the complete setup.

## Configuration

### Environment Variables

Already configured in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://rziohajwncqcgzorjqff.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Project Info

- **Project ID:** `rziohajwncqcgzorjqff`
- **Project URL:** `https://rziohajwncqcgzorjqff.supabase.co`

## Database Setup

### Migrations Applied

1. ✅ `001_initial_schema.sql` - All tables, triggers, indexes, RLS
2. ✅ `002_rls_policies_fix.sql` - RLS policy fixes
3. ✅ `003_storage_functions.sql` - Storage management functions

### Verify Migrations

```bash
# Check migrations status
npx supabase migration list --project-id rziohajwncqcgzorjqff
```

## Authentication Setup

### Google OAuth Configuration

1. Go to [Supabase Dashboard → Authentication → Providers](https://supabase.com/dashboard/project/rziohajwncqcgzorjqff/auth/providers)
2. Enable **Google** provider
3. Add OAuth credentials:
   - **Client ID:** From Google Cloud Console
   - **Client Secret:** From Google Cloud Console
4. Add authorized redirect URLs:
   - `https://rziohajwncqcgzorjqff.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local dev)

### Magic Link Configuration

Magic link is enabled by default. Configure email templates in:
- Supabase Dashboard → Authentication → Email Templates

### Auth Callback URL

The callback route is at `/auth/callback` and handles:
- Code exchange for session
- Redirect to `/studio` or custom redirect URL

## Client Setup

### Server-Side Client

```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Client-Side Client

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Admin Client (Service Role)

```typescript
import { supabaseAdmin } from '@/lib/supabase/admin';

// Use only in server-side code (API routes, webhooks)
const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
```

## Middleware

The middleware (`src/middleware.ts`) handles:
- Session refresh
- Protected route authentication
- Redirect to login for unauthenticated users
- Redirect to studio for authenticated users on login page

### Protected Routes

- `/studio/*`
- `/billing/*`
- `/projects/*`
- `/heroes/*`

### Public Routes

- `/`
- `/login`
- `/api/webhooks/*`

## Authentication Functions

### Sign In with Google

```typescript
import { signInWithGoogle } from '@/lib/supabase/auth';

await signInWithGoogle('/studio'); // Optional redirect
```

### Sign In with Magic Link

```typescript
import { signInWithMagicLink } from '@/lib/supabase/auth';

await signInWithMagicLink('user@example.com', '/studio');
```

### Sign Out

```typescript
import { signOut } from '@/lib/supabase/auth';

await signOut();
```

## React Hooks

### useAuth Hook

```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {user.email}</div>;
}
```

## Database Queries

### Get Profile

```typescript
import { getProfile } from '@/lib/supabase/queries';

const profile = await getProfile(userId);
```

### Update Profile

```typescript
import { updateProfile } from '@/lib/supabase/queries';

await updateProfile(userId, {
  plan: 'starter',
  blots: 300,
});
```

### Get Projects

```typescript
import { getUserProjects } from '@/lib/supabase/queries';

const projects = await getUserProjects(userId);
```

## Type Generation

Generate TypeScript types from your database:

```bash
# From remote project
npx supabase gen types typescript --project-id rziohajwncqcgzorjqff > src/lib/supabase/types.ts

# From local (if using Supabase CLI)
npx supabase gen types typescript --local > src/lib/supabase/types.ts
```

## Row Level Security (RLS)

RLS is enabled on all tables. Policies ensure:
- Users can only access their own data
- Soft-deleted projects are hidden
- Global config is read-only for clients

### Testing RLS

```typescript
// As user A
const { data } = await supabase.from('projects').select('*');
// Only returns user A's projects

// As user B
const { data } = await supabase.from('projects').select('*');
// Only returns user B's projects
```

## Triggers

### Auto-Create Profile

When a user signs up, a profile is automatically created via trigger:
- Trigger: `on_auth_user_created`
- Function: `handle_new_user()`
- Creates profile with `plan='free'`, `blots=50`

## Real-time (Future)

Supabase real-time can be enabled for:
- Job status updates
- Live collaboration (future)
- Notifications (future)

## Security Checklist

- [x] RLS enabled on all tables
- [x] RLS policies tested
- [x] Service role key secured (server-side only)
- [x] Anon key is public (safe for client-side)
- [x] Auth providers configured
- [x] Callback URLs configured
- [x] Middleware protecting routes
- [x] Profile trigger working

## Troubleshooting

### "Invalid API key"
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Verify keys match Supabase Dashboard

### "User not found"
- Check profile trigger is working
- Verify RLS policies allow access

### "Access denied"
- Check RLS policies
- Verify user owns the resource
- Check `deleted_at IS NULL` filters

### Auth redirect loops
- Check middleware configuration
- Verify callback URL matches Supabase settings
- Check redirect URLs are whitelisted

## Production Checklist

- [ ] Google OAuth configured with production URLs
- [ ] Email templates customized
- [ ] Custom domain configured (if using)
- [ ] RLS policies tested in production
- [ ] Database backups enabled
- [ ] Monitoring set up
- [ ] Rate limiting configured
