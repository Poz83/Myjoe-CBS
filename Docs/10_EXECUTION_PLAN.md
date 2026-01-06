# Execution Plan

## Overview

**Timeline:** 30 days to production-ready  
**Approach:** Build incrementally, commit often, test each phase

---

## Git Workflow

### Branch Strategy

```
main (production - don't touch until launch)
  └── develop (staging)
        ├── feature/phase-1-setup
        ├── feature/phase-2-auth
        ├── feature/phase-3-projects
        └── ...
```

### Commit Convention

```
feat: add hero creation flow
fix: correct blot deduction on edit
refactor: extract AI pipeline to separate module
docs: update API contracts
style: fix button alignment
test: add RLS policy tests
chore: update dependencies
```

### Git Checkpoints

After each phase, create a tagged commit:

```bash
git add .
git commit -m "feat: complete phase X - [description]"
git tag -a vX.X -m "Phase X complete"
git push origin develop --tags
```

---

## Phase 1: Foundation (Days 1-3)

### Goals
- Project scaffolding
- Database schema deployed
- Basic auth working
- Design system in place

### Tasks

```
□ 1.1 Project Setup
  □ Create Next.js 14 project with TypeScript
  □ Configure Tailwind CSS
  □ Set up folder structure per 02_ARCHITECTURE.md
  □ Install dependencies:
    - @supabase/supabase-js, @supabase/ssr
    - @tanstack/react-query
    - zustand
    - zod
    - lucide-react
    - sharp
    - stripe
    - openai
    - @aws-sdk/client-s3

□ 1.2 Supabase Setup
  □ Create Supabase project (myjoe-staging)
  □ Run all migrations from 03_DATA_MODEL.md
  □ Enable RLS on all tables
  □ Create profile trigger
  □ Test RLS policies manually

□ 1.3 Environment Configuration
  □ Create .env.local with all variables
  □ Add .env.local to .gitignore
  □ Create .env.example (without values)
  □ Configure Vercel environment (staging)

□ 1.4 Design System
  □ Create src/components/ui/ primitives:
    - button.tsx
    - input.tsx
    - card.tsx
    - skeleton.tsx
    - toast.tsx
    - tooltip.tsx
  □ Set up globals.css with color variables
  □ Test components in isolation
```

### Git Checkpoint

```bash
git checkout -b feature/phase-1-setup
# ... do work ...
git add .
git commit -m "feat: complete phase 1 - project foundation"
git push origin feature/phase-1-setup
# Create PR, merge to develop
git checkout develop
git pull
git tag -a v0.1 -m "Phase 1: Foundation complete"
```

---

## Phase 2: Authentication (Days 4-5)

### Goals
- Google OAuth working
- Magic Link working
- Protected routes
- Profile auto-creation

### Tasks

```
□ 2.1 Auth Setup
  □ Configure Supabase Auth providers (Google)
  □ Set up OAuth callback URL
  □ Create auth middleware (middleware.ts)
  
□ 2.2 Auth Pages
  □ Create /login page
    - Google button
    - Magic link form
    - Error handling
  □ Create /auth/callback route
  
□ 2.3 Auth Flow
  □ Test Google OAuth end-to-end
  □ Test Magic Link end-to-end
  □ Verify profile is auto-created
  □ Test redirect after login
  □ Test protected route blocking

□ 2.4 User Menu
  □ Create user dropdown in header
  □ Show email/avatar
  □ Sign out functionality
```

### Git Checkpoint

```bash
git checkout -b feature/phase-2-auth
# ... do work ...
git commit -m "feat: complete phase 2 - authentication"
# Merge to develop, tag v0.2
```

---

## Phase 3: Projects CRUD (Days 6-8)

### Goals
- Create/list/edit/delete projects
- Project wizard with DNA selection
- Page grid view

### Tasks

```
□ 3.1 Projects API
  □ GET /api/projects (list)
  □ POST /api/projects (create)
  □ GET /api/projects/[id]
  □ PATCH /api/projects/[id]
  □ DELETE /api/projects/[id]

□ 3.2 Projects UI
  □ Projects list page (/studio/projects)
  □ Empty state
  □ Project cards with thumbnails
  
□ 3.3 Project Wizard
  □ Step 1: Name + page count
  □ Step 2: Audience selection (visual buttons)
  □ Step 3: Style preset selection (visual samples)
  □ Step 4: Hero selection (optional, from library)
  □ DNA derivation logic (audience → line weight, complexity)
  
□ 3.4 Project Editor Shell
  □ 3-column layout
  □ Left: page thumbnails
  □ Center: selected page preview
  □ Right: inspector (placeholder)
  □ Header with project name + actions
```

### Git Checkpoint

```bash
git commit -m "feat: complete phase 3 - projects CRUD"
git tag -a v0.3 -m "Phase 3: Projects complete"
```

---

## Phase 4: AI Pipeline (Days 9-13)

### Goals
- Planner-Compiler working
- Image generation working
- Cleanup pipeline working
- Quality gate working

### Tasks

```
□ 4.1 Planner-Compiler
  □ Create src/server/ai/planner-compiler.ts
  □ Implement system prompt from 05_AI_PIPELINE.md
  □ Test with sample inputs
  □ Verify JSON output parsing

□ 4.2 Image Generator
  □ Create src/server/ai/image-generator.ts
  □ GPT Image 1.5 integration
  □ Handle with/without reference images
  □ Error handling + retries

□ 4.3 Cleanup Pipeline
  □ Create src/server/ai/cleanup.ts
  □ Sharp-based binarization
  □ Despeckle logic
  □ Resize to trim size
  □ Test with sample images

□ 4.4 Quality Gate
  □ Create src/server/ai/quality-gate.ts
  □ B&W check
  □ Content check
  □ Margin check
  □ Scoring logic

□ 4.5 Integration
  □ Create src/server/ai/generate-page.ts
  □ Wire: compile → generate → cleanup → quality → store
  □ Test full pipeline end-to-end
```

### Git Checkpoint

```bash
git commit -m "feat: complete phase 4 - AI pipeline"
git tag -a v0.4 -m "Phase 4: AI Pipeline complete"
```

---

## Phase 5: Style Calibration (Days 14-15)

### Goals
- Generate 4 style samples
- User picks anchor
- Anchor stored and used

### Tasks

```
□ 5.1 Calibration API
  □ POST /api/projects/[id]/calibrate
  □ POST /api/projects/[id]/calibrate/select

□ 5.2 Calibration UI
  □ Subject input
  □ 4 sample grid display
  □ Selection interaction
  □ Confirmation

□ 5.3 Integration
  □ Style anchor stored in project
  □ Style anchor passed to generation
  □ Test consistency improvement
```

### Git Checkpoint

```bash
git commit -m "feat: complete phase 5 - style calibration"
git tag -a v0.5 -m "Phase 5: Style Calibration complete"
```

---

## Phase 6: Generation Jobs (Days 16-18)

### Goals
- Async job processing
- Progress UI
- 40-page generation working

### Tasks

```
□ 6.1 Jobs API
  □ POST /api/generate (start job)
  □ GET /api/generate/[jobId] (status)
  □ POST /api/generate/[jobId]/cancel

□ 6.2 Job Processing
  □ Background worker logic
  □ Batch processing (3 concurrent)
  □ Progress updates
  □ Error handling per page
  □ Retry logic

□ 6.3 Progress UI
  □ Job status polling
  □ Progress bar with stages
  □ Page thumbnails appearing as completed
  □ Cancel button
  □ Error display

□ 6.4 R2 Storage
  □ Create src/server/storage/r2-client.ts
  □ Upload images
  □ Generate thumbnails
  □ Signed URL generation

□ 6.5 Integration
  □ Generate 40-page book end-to-end
  □ Verify all pages stored
  □ Verify thumbnails display
```

### Git Checkpoint

```bash
git commit -m "feat: complete phase 6 - generation jobs"
git tag -a v0.6 -m "Phase 6: Generation Jobs complete"
```

---

## Phase 7: Hero System (Days 19-21)

### Goals
- Hero creation with reference sheet
- Hero library
- Hero used in generation

### Tasks

```
□ 7.1 Hero API
  □ GET /api/heroes
  □ POST /api/heroes (async - returns job)
  □ GET /api/heroes/[id]
  □ DELETE /api/heroes/[id]

□ 7.2 Hero Reference Sheet
  □ Hero compiler (description → detailed prompt)
  □ Reference sheet generation (2×2 grid)
  □ Store reference + thumbnail

□ 7.3 Hero UI
  □ Hero library page (/studio/library)
  □ Hero creation wizard
  □ Audience selection for hero
  □ Approval/regenerate flow
  □ Hero cards with usage count

□ 7.4 Hero in Generation
  □ Hero selector in project wizard
  □ Hero reference passed to image generator
  □ Test consistency with hero
```

### Git Checkpoint

```bash
git commit -m "feat: complete phase 7 - hero system"
git tag -a v0.7 -m "Phase 7: Hero System complete"
```

---

## Phase 8: Page Editor (Days 22-24)

### Goals
- View page versions
- Chat-based edits
- Paintbrush inpainting
- Version restore

### Tasks

```
□ 8.1 Page API
  □ GET /api/pages/[id]
  □ POST /api/pages/[id]/edit
  □ POST /api/pages/[id]/restore

□ 8.2 Edit Canvas
  □ Canvas component for painting mask
  □ Brush tool
  □ Circle/rectangle tools
  □ Size control
  □ Clear selection
  □ Export mask as data URL

□ 8.3 Edit Flow
  □ Chat input for edit prompt
  □ Mask + prompt → inpaint API
  □ New version created
  □ Display updated image

□ 8.4 Version History
  □ Show version thumbnails
  □ Restore any version
  □ Version comparison (optional)

□ 8.5 Quick Actions
  □ Regenerate button
  □ Simplify button
  □ Add detail button
```

### Git Checkpoint

```bash
git commit -m "feat: complete phase 8 - page editor"
git tag -a v0.8 -m "Phase 8: Page Editor complete"
```

---

## Phase 9: Export (Days 25-26)

### Goals
- PDF export working
- PNG zip export
- KDP-compliant output

### Tasks

```
□ 9.1 Export API
  □ POST /api/export
  □ GET /api/export/[jobId]

□ 9.2 PDF Generation
  □ Combine pages into multi-page PDF
  □ Correct page size
  □ 300 DPI
  □ Proper margins

□ 9.3 Download
  □ Generate signed download URL
  □ Download button in UI
  □ Expiry handling

□ 9.4 Testing
  □ Upload to KDP preview
  □ Verify margins
  □ Verify quality
```

### Git Checkpoint

```bash
git commit -m "feat: complete phase 9 - export"
git tag -a v0.9 -m "Phase 9: Export complete"
```

---

## Phase 10: Billing (Days 27-28)

### Goals
- Stripe integration
- Blot tracking
- Upgrade/downgrade flow

### Tasks

```
□ 10.1 Stripe Setup
  □ Create Stripe products + prices
  □ Configure webhook endpoint
  □ Test in Stripe test mode

□ 10.2 Checkout Flow
  □ POST /api/billing/checkout
  □ Redirect to Stripe
  □ Success/cancel handling

□ 10.3 Webhook Handler
  □ checkout.session.completed
  □ invoice.payment_succeeded
  □ invoice.payment_failed
  □ customer.subscription.deleted

□ 10.4 Blot Management
  □ Blot balance display in header
  □ Deduct on generation/edit
  □ Cost preview modal
  □ Insufficient blots error

□ 10.5 Billing UI
  □ Billing page (/studio/billing)
  □ Current plan display
  □ Upgrade options
  □ Stripe portal link

□ 10.6 Testing
  □ Test with Stripe CLI
  □ Test upgrade flow
  □ Test renewal
  □ Test cancellation
```

### Git Checkpoint

```bash
git commit -m "feat: complete phase 10 - billing"
git tag -a v0.10 -m "Phase 10: Billing complete"
```

---

## Phase 11: Polish (Days 29-30)

### Goals
- All edge cases handled
- Error states
- Empty states
- Performance
- Final testing

### Tasks

```
□ 11.1 Edge Cases
  □ Browser close mid-generation
  □ Payment failure grace period
  □ Storage quota enforcement
  □ Session timeout handling

□ 11.2 Empty States
  □ No projects
  □ No heroes
  □ No pages (new project)

□ 11.3 Error States
  □ Generation failed
  □ Network error
  □ Rate limited

□ 11.4 Loading States
  □ Replace spinners with skeletons
  □ Progress indicators

□ 11.5 Analytics
  □ PostHog setup
  □ Key events tracked

□ 11.6 Error Monitoring
  □ Sentry setup
  □ Error boundaries

□ 11.7 Final Testing
  □ Full user journey test
  □ Mobile responsive check
  □ Cross-browser check

□ 11.8 Pre-Launch Checklist
  □ Remove console.logs
  □ Check all env vars in Vercel
  □ Switch Stripe to live mode
  □ DNS configured for myjoe.app
  □ Legal pages in place
```

### Git Checkpoint

```bash
git commit -m "feat: complete phase 11 - polish"
git tag -a v1.0-rc1 -m "Release Candidate 1"
```

---

## Deployment Checklist

### Vercel Setup

```
□ Create Vercel project
□ Connect to GitHub repo
□ Set production branch to 'main'
□ Add all environment variables
□ Configure custom domain (myjoe.app)
□ Enable Analytics
```

### Environment Variables (Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=https://myjoe.app
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
```

### Final Launch

```bash
# Merge develop to main
git checkout main
git merge develop
git push origin main

# Vercel auto-deploys from main
# Monitor for errors
```

---

## Daily Routine

```
Morning:
  1. Pull latest from develop
  2. Create feature branch
  3. Read relevant doc section
  4. Build

During:
  1. Commit every ~30 mins of working code
  2. Test as you go
  3. Reference docs for implementation details

Evening:
  1. Push branch
  2. Create PR if feature complete
  3. Note blockers for tomorrow
```

---

## If Things Go Wrong

| Problem | Solution |
|---------|----------|
| AI breaks code | `git stash`, try again with clearer prompt |
| Lost progress | `git log` → `git checkout <commit>` |
| Confused state | `git status` → commit or discard |
| Bad merge | `git reset --hard HEAD~1` |
| Need fresh start | `git checkout develop` → new branch |

**Golden rule:** Commit working code often. You can always go back.
