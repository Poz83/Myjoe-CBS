# Cursor Prompts - Copy & Paste Ready

> Each prompt is self-contained. Just copy, paste, verify, move on.
> After each section: test it works, then commit.

## Git Repository
```
git@github.com:Poz83/Myjoe-CBS.git
```

---

# PHASE 1: FOUNDATION

---

## Prompt 1.1 - Project Setup

```
I'm building Myjoe, an AI coloring book studio for KDP publishers.

Create a new Next.js 14 project with these specifications:

TECH STACK:
- Next.js 14 with App Router
- TypeScript (strict mode)
- TailwindCSS

FOLDER STRUCTURE - create this exactly:
src/
├── app/
│   ├── (auth)/           # Auth pages (login, callback)
│   ├── (studio)/         # Protected app pages
│   └── api/              # API routes
├── components/
│   ├── ui/               # Primitives (button, input, card)
│   ├── features/         # Feature components
│   └── layout/           # Layout components
├── server/
│   ├── ai/               # AI pipeline code
│   ├── db/               # Database queries
│   ├── storage/          # R2 storage
│   └── billing/          # Stripe billing
├── lib/                  # Shared utilities
├── hooks/                # React hooks
└── types/                # TypeScript types

DEPENDENCIES TO INSTALL:
npm install @supabase/supabase-js @supabase/ssr @tanstack/react-query zustand zod lucide-react
npm install sharp stripe openai @aws-sdk/client-s3
npm install -D @types/node

TAILWIND CONFIG:
- Use 4px grid system (spacing multiples of 4)
- Add custom colors for dark theme:
  - bg-base: #0D0D0D (page background)
  - bg-surface: #1A1A1A (cards, panels)
  - bg-elevated: #262626 (modals, dropdowns)
  - bg-canvas: #171717 (neutral canvas surround)
- Default to dark mode

GIT SETUP:
After creating project, initialize git and add remote:
git init
git remote add origin git@github.com:Poz83/Myjoe-CBS.git

Create the project structure now. Include a basic layout.tsx in (studio) with dark background.
```

**After completing: Test `npm run dev` works, then commit:**
```bash
git add .
git commit -m "feat(1.1): project setup with folder structure"
git push -u origin main
```

---

## Prompt 1.2 - Supabase Database Schema

```
I'm building Myjoe. Project setup is complete.

Create Supabase database migrations for all tables. Create a file at supabase/migrations/001_initial_schema.sql

TABLES NEEDED:

1. profiles
- id (uuid, PK)
- owner_id (uuid, FK to auth.users, unique)
- plan (text: 'free'|'starter'|'creator'|'pro', default 'free')
- blots (integer, default 50)
- blots_reset_at (timestamptz)
- stripe_customer_id (text)
- stripe_subscription_id (text)
- storage_used_bytes (bigint, default 0)
- storage_limit_bytes (bigint, default 1073741824)
- disabled_at (timestamptz)
- created_at, updated_at (timestamptz)

2. projects
- id (uuid, PK)
- owner_id (uuid, FK to auth.users)
- hero_id (uuid, FK to heroes, nullable)
- name (text)
- description (text)
- page_count (integer, 1-45)
- trim_size (text: '8.5x11'|'8.5x8.5'|'6x9')
- audience (text: 'toddler'|'children'|'tween'|'teen'|'adult')
- style_preset (text: 'bold-simple'|'kawaii'|'whimsical'|'cartoon'|'botanical')
- line_weight (text: 'thick'|'medium'|'fine')
- complexity (text: 'minimal'|'moderate'|'detailed'|'intricate')
- style_anchor_key (text)
- style_anchor_description (text)
- status (text: 'draft'|'generating'|'ready'|'exported', default 'draft')
- created_at, updated_at, deleted_at (timestamptz)

3. heroes
- id (uuid, PK)
- owner_id (uuid, FK)
- name (text)
- description (text)
- audience (text)
- compiled_prompt (text)
- negative_prompt (text)
- reference_key (text)
- thumbnail_key (text)
- style_preset (text, nullable)
- times_used (integer, default 0)
- created_at, updated_at, deleted_at (timestamptz)

4. pages
- id (uuid, PK)
- project_id (uuid, FK)
- sort_order (integer)
- page_type (text: 'illustration'|'text-focus'|'pattern'|'educational')
- current_version (integer, default 1)
- scene_brief (text)
- created_at, updated_at (timestamptz)
- UNIQUE(project_id, sort_order)

5. page_versions
- id (uuid, PK)
- page_id (uuid, FK)
- version (integer)
- asset_key (text)
- thumbnail_key (text)
- compiled_prompt (text)
- negative_prompt (text)
- seed (text)
- compiler_snapshot (jsonb)
- quality_score (real)
- quality_status (text: 'pass'|'needs_review'|'fail')
- edit_type (text: 'initial'|'regenerate'|'inpaint'|'quick_action')
- edit_prompt (text)
- edit_mask_key (text)
- blots_spent (integer, default 0)
- created_at (timestamptz)
- UNIQUE(page_id, version)

6. jobs
- id (uuid, PK)
- owner_id (uuid, FK)
- project_id (uuid, FK, nullable)
- type (text: 'generation'|'export'|'hero_creation')
- status (text: 'pending'|'processing'|'completed'|'failed'|'cancelled')
- total_items (integer, default 0)
- completed_items (integer, default 0)
- failed_items (integer, default 0)
- blots_reserved (integer, default 0)
- blots_spent (integer, default 0)
- blots_refunded (integer, default 0)
- error_message (text)
- created_at, started_at, completed_at (timestamptz)

7. job_items
- id (uuid, PK)
- job_id (uuid, FK)
- page_id (uuid, FK, nullable)
- status (text: 'pending'|'processing'|'completed'|'failed'|'skipped')
- retry_count (integer, default 0)
- asset_key (text)
- error_message (text)
- created_at, started_at, completed_at (timestamptz)

8. assets
- id (uuid, PK)
- owner_id (uuid, FK)
- type (text: 'page'|'thumbnail'|'hero'|'export'|'style_anchor')
- r2_key (text, unique)
- size_bytes (bigint)
- content_type (text)
- project_id (uuid, FK, nullable)
- hero_id (uuid, FK, nullable)
- created_at (timestamptz)

9. global_config
- key (text, PK)
- value (jsonb)
- description (text)
- updated_at (timestamptz)

ALSO ADD:
- Trigger to auto-create profile when auth.users row is created
- Insert default global_config values (generation_enabled, export_enabled, signup_enabled, maintenance_mode)
- All appropriate indexes

Generate the complete SQL migration file.
```

**After completing: Run migration in Supabase, then commit:**
```bash
git add .
git commit -m "feat(1.2): database schema migration"
```

---

## Prompt 1.3 - RLS Policies

```
I'm building Myjoe. Database schema is created.

Create Row Level Security policies for all tables. Create file supabase/migrations/002_rls_policies.sql

POLICIES NEEDED:

1. profiles - users can only view/update their own profile
2. projects - users can CRUD only their own projects (check deleted_at IS NULL)
3. heroes - users can CRUD only their own heroes
4. pages - users can CRUD pages where they own the parent project
5. page_versions - users can CRUD versions where they own the parent page's project
6. jobs - users can view only their own jobs
7. job_items - users can view items where they own the parent job
8. assets - users can CRUD only their own assets
9. global_config - anyone can read (SELECT), no one can write via client

Use auth.uid() to get current user ID.

Enable RLS on every table with: ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

Generate the complete SQL file.
```

**After completing: Run migration, test manually, then commit:**
```bash
git add .
git commit -m "feat(1.3): RLS policies for all tables"
```

---

## Prompt 1.4 - Environment Setup

```
I'm building Myjoe. Database is set up.

Create environment configuration files:

1. Create .env.example with all required variables (no values, just keys):

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
R2_PUBLIC_URL=

# OpenAI
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Email
RESEND_API_KEY=

2. Update .gitignore to include:
.env.local
.env*.local

3. Create src/lib/constants.ts with app constants:
- BLOT_COSTS object (generate: 12, edit: 12, calibration: 10, hero: 15, export: 3)
- PLAN_LIMITS object (blots and storage for each plan)
- TRIM_SIZES object (dimensions in pixels at 300 DPI)
- AUDIENCES array
- STYLE_PRESETS array
- MAX_PAGES = 45
- MAX_VERSIONS = 10

Generate these files now.
```

**After completing: Create your .env.local with real values, then commit:**
```bash
git add .
git commit -m "feat(1.4): environment configuration"
```

---

## Prompt 1.5 - UI Components (Part 1)

```
I'm building Myjoe. Environment is configured.

Create UI primitive components in src/components/ui/. Use Tailwind only, dark theme, 4px grid.

DESIGN SYSTEM SPECS:
- 4px spacing grid (all spacing multiples of 4: 4, 8, 12, 16, 20, 24, 32px)
- Border radius: 4px (small), 6px (default), 8px (cards), 12px (modals)
- Button heights: 32px (sm), 40px (md), 48px (lg)
- Input height: 40px
- Icon sizes: 16px, 20px, 24px (use w-4, w-5, w-6)

Create these files:

1. button.tsx
- Variants: primary (blue-600), secondary (zinc-700), ghost (transparent), danger (red-600)
- Sizes: sm (h-8), md (h-10), lg (h-12)
- Support: disabled state, loading state with Loader icon spinning, icon + text
- Use forwardRef, proper TypeScript types
- Include transition-colors for hover states

2. input.tsx
- Dark theme: bg-zinc-900, border-zinc-700
- Height: h-10 (40px)
- Focus ring: ring-2 ring-blue-500/40 border-blue-500
- Support: error state (red border), disabled state
- Use forwardRef

3. card.tsx
- Background: bg-zinc-900
- Border: border border-zinc-800 hover:border-zinc-700
- Padding: p-5 (20px, 4px grid)
- Rounded: rounded-lg (8px)
- Variants: default, interactive (with hover effect)

Generate these 3 files.
```

```bash
git add . && git commit -m "feat(1.5): button, input, card components"
```

---

## Prompt 1.6 - UI Components (Part 2)

```
I'm building Myjoe. Button, input, card components are done.

Create more UI components in src/components/ui/:

1. skeleton.tsx
- Animated placeholder for loading states
- Use animate-pulse with subtle shimmer effect
- Variants: text (h-4 rounded), title (h-6 rounded), image (aspect-[3/4] rounded-lg), card
- Add shimmer gradient animation for premium feel:
  background: linear-gradient(90deg, #1a1a1a 25%, #262626 50%, #1a1a1a 75%)
  animation: shimmer 1.5s infinite

2. toast.tsx (using sonner library)
- Install: npm install sonner
- Create Toaster component to add to layout
- Export toast function
- Styles: dark theme, rounded-lg, border-zinc-800
- Variants: success (green), error (red), info (blue)

3. tooltip.tsx
- Simple hover tooltip
- Dark background (bg-zinc-800), small text
- Position: top by default
- Delay: 200ms before showing

4. dialog.tsx (modal)
- Backdrop: bg-black/60 backdrop-blur-sm
- Content: bg-zinc-900 rounded-lg border-zinc-800 shadow-modal
- Close button in top-right
- Trap focus inside modal
- Close on Escape key

5. accordion.tsx
- For collapsible sections in inspector panel
- Header with ChevronDown icon that rotates
- Smooth height transition
- Border bottom between items

6. tabs.tsx
- Horizontal tabs for panel navigation
- Active: text-white border-b-2 border-blue-500
- Inactive: text-zinc-400 hover:text-white
- No background, just underline indicator

Generate all 6 files.
```

```bash
git add . && git commit -m "feat(1.6): skeleton, toast, tooltip, dialog, accordion, tabs"
```

---

## Prompt 1.7 - Global Layout

```
I'm building Myjoe. UI components are done.

Create the global layout structure with FLUID 3-COLUMN LAYOUT:

1. Create src/app/globals.css:
- Import Tailwind directives
- Add Inter font from Google Fonts
- Body: bg-[#0D0D0D] text-white
- Add shimmer keyframe animation
- Set min-width: 1024px on body

2. Create src/components/layout/header.tsx:
- Fixed header: h-14 (56px), bg-zinc-900/80 backdrop-blur-sm
- Logo on left
- Nav links center (optional)
- Right side: Auto-save indicator, Blot balance (🎨 icon + number), User menu
- Auto-save shows: "Saving..." with spinner, "Saved" with cloud icon, or error state

3. Create src/components/layout/sidebar.tsx (Left Panel):
- Width: w-[300px] (300px default)
- Collapsible via toggle button
- Contains tabs at top: Pages | Assets | History
- Scrollable content area below tabs
- Sticky at full viewport height

4. Create src/components/layout/inspector.tsx (Right Panel):
- Width: w-[360px] (360px default)
- Collapsible via toggle button
- Context-sensitive content using accordion sections
- Sticky at full viewport height

5. Create src/app/(studio)/layout.tsx:
- Import header, sidebar, inspector
- FLUID 3-column grid layout:
  grid-template-columns: auto 1fr auto
- Main content fills remaining space (min-w-[400px])
- Full viewport height: h-screen
- Panels can be toggled via state

RESPONSIVE BEHAVIOR:
- ≥1440px: All panels visible
- 1280-1439px: All visible, tighter spacing  
- 1024-1279px: Right panel auto-collapses to overlay
- <1024px: Show "Desktop required" message

Generate all these files.
```

**After completing: Verify layout renders at localhost:3000, then commit:**
```bash
git add .
git commit -m "feat(1.7): global styles and fluid 3-column studio layout"
git tag -a v0.1 -m "Phase 1 complete: Foundation"
git push origin main --tags
```

---

# PHASE 2: AUTHENTICATION

---

## Prompt 2.1 - Supabase Clients

```
I'm building Myjoe. Phase 1 (Foundation) is complete.

Create Supabase client utilities:

1. src/lib/supabase/client.ts
- Browser client using createBrowserClient from @supabase/ssr
- Use NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

2. src/lib/supabase/server.ts
- Server client using createServerClient from @supabase/ssr
- Handle cookies properly for App Router
- Export async function createClient() that returns configured client

3. src/lib/supabase/admin.ts
- Admin client using createClient from @supabase/supabase-js
- Use SUPABASE_SERVICE_ROLE_KEY
- For server-side operations that bypass RLS

4. src/types/database.ts
- Placeholder file with comment to generate types via:
  npx supabase gen types typescript --local > src/types/database.ts

Generate these files with proper TypeScript types.
```

**After completing: Test import works, then commit:**
```bash
git add .
git commit -m "feat(2.1): supabase client utilities"
```

---

## Prompt 2.2 - Auth Middleware

```
I'm building Myjoe. Supabase clients are set up.

Create authentication middleware:

1. src/middleware.ts (in project root, not src)
- Import createServerClient from @supabase/ssr
- Create middleware function that:
  a. Creates Supabase client with request cookies
  b. Calls getUser() to check auth status
  c. Refreshes session if needed
  d. Updates response cookies

PUBLIC ROUTES (no auth required):
- / (landing page)
- /login
- /auth/callback
- /api/webhooks (all webhook routes)

PROTECTED ROUTES:
- /studio/* (all studio routes)
- /api/* (except webhooks)

LOGIC:
- If user is logged in and visits /login → redirect to /studio
- If user is NOT logged in and visits protected route → redirect to /login?redirect={original_path}

2. Update next.config.js to configure middleware matcher:
- Match all routes except static files and images

Generate these files.
```

**After completing: Test middleware redirects, then commit:**
```bash
git add .
git commit -m "feat(2.2): auth middleware with route protection"
```

---

## Prompt 2.3 - Login Page

```
I'm building Myjoe. Auth middleware is set up.

Create the login page at src/app/(auth)/login/page.tsx:

LAYOUT:
- Centered card on dark background (#0D0D0D)
- Card: bg-zinc-900, max-w-md, p-8, rounded-lg
- Logo at top (placeholder or text "Myjoe")
- "Welcome to Myjoe" heading (text-2xl font-semibold)
- Subtext: "Create beautiful coloring books with AI" (text-zinc-400)

FEATURES:
1. Google Sign In button
   - Use Supabase signInWithOAuth
   - Provider: 'google'
   - Redirect to /auth/callback
   - Button style: bg-white text-gray-900 (stands out)

2. Divider with "or" (flex with lines on each side)

3. Magic Link form
   - Email input (use our input component)
   - "Send Magic Link" button (primary style)
   - Use Supabase signInWithOtp
   - Show success message after sending ("Check your email!")

4. Error handling
   - Read ?error param from URL
   - Display error message in red if present

Also create src/app/(auth)/layout.tsx:
- Simple centered layout with flexbox
- No header/sidebar (just the auth card)
- Dark background, min-h-screen

Generate both files.
```

**After completing: Test Google OAuth button works, then commit:**
```bash
git add .
git commit -m "feat(2.3): login page with Google and magic link"
```

---

## Prompt 2.4 - Auth Callback

```
I'm building Myjoe. Login page is done.

Create the OAuth callback handler at src/app/auth/callback/route.ts:

This is a Route Handler (not a page).

LOGIC:
1. Get 'code' from URL searchParams
2. Get 'next' from URL searchParams (default to '/studio')
3. If code exists:
   a. Create Supabase server client
   b. Call exchangeCodeForSession(code)
   c. If successful, redirect to 'next' URL
   d. If error, redirect to /login?error=auth_failed
4. If no code, redirect to /login?error=no_code

Use NextResponse.redirect() for redirects.
Make sure to use the request origin for redirect URLs.

Generate the route handler file.
```

**After completing: Test full OAuth flow, then commit:**
```bash
git add .
git commit -m "feat(2.4): OAuth callback handler"
```

---

## Prompt 2.5 - User Session Hook

```
I'm building Myjoe. Auth callback is working.

Create user session management:

1. src/hooks/use-user.ts
- Custom hook that returns current user
- Use Supabase onAuthStateChange to listen for changes
- Return: { user, isLoading, error }
- Cache user in state

2. src/hooks/use-profile.ts
- Fetch user's profile from profiles table
- Use TanStack Query
- Return: { profile, isLoading, error, refetch }
- Query key: ['profile', user.id]

3. src/components/features/auth/user-menu.tsx
- Dropdown menu in header
- Show user avatar (first letter of email in circle, bg-zinc-700) and email
- Menu items: Settings, Billing, Sign Out
- Sign out calls supabase.auth.signOut() then redirects to /login
- Dropdown: bg-zinc-900 border-zinc-800 rounded-lg shadow-lg

4. Update src/components/layout/header.tsx
- Import and use UserMenu component
- Show skeleton while loading
- Show "Sign In" button if not logged in

Generate all these files.
```

**After completing: Test user menu works, then commit:**
```bash
git add .
git commit -m "feat(2.5): user session and profile hooks"
```

---

## Prompt 2.6 - Auth Testing & Cleanup

```
I'm building Myjoe. User session is working.

Final auth cleanup:

1. Create src/app/(studio)/page.tsx (dashboard redirect)
- Server component
- Redirect to /studio/projects immediately
- This is just a redirect, no UI needed

2. Update src/app/(studio)/layout.tsx
- Fetch user server-side using createClient
- If no user, redirect to /login (backup protection)
- Pass user to header via props or context

3. Create src/lib/auth.ts with helper functions:
- getCurrentUser(): Get user from server client
- requireAuth(): Throw if not authenticated (for API routes)
- getSession(): Get full session object

4. Test checklist (verify manually):
- [ ] Can sign in with Google
- [ ] Redirected to /studio after login
- [ ] Can see user menu with email
- [ ] Can sign out
- [ ] Cannot access /studio when logged out
- [ ] Redirected to login with ?redirect param preserved

Generate the files and confirm auth flow is complete.
```

**After completing: Full auth test, then commit and tag:**
```bash
git add .
git commit -m "feat(2.6): auth flow complete"
git tag -a v0.2 -m "Phase 2 complete: Authentication"
git push origin main --tags
```

---

# REMAINING PHASES

Continue to Phase 3 in `prompts/PROMPTS_3-6.md`.
Each prompt follows the same pattern:
- Self-contained with full context
- Specifies exact files to create
- Includes the git commit command

---

# QUICK REFERENCE

## Start a New Session
```
I'm building Myjoe. I last completed prompt [X.X].
Let's continue with the next prompt.
```

## Check Progress
```
Read PROGRESS.md and tell me:
- Current phase
- Next prompt to do
- Any blockers
```

## Fix a Bug
```
Bug: [describe what's wrong]
Expected: [what should happen]  
Actual: [what's happening]
File: [which file]

Fix it while keeping the existing code style.
```

## After Each Prompt
```bash
# Test it works
npm run dev

# Commit
git add .
git commit -m "feat(X.X): [description]"

# Push regularly
git push origin main

# After completing a phase, tag it
git tag -a v0.X -m "Phase X complete: [name]"
git push origin main --tags
```
