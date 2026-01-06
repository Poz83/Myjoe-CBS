# Progress Tracking Prompt

> Paste this into Cursor at the start of your project. It will create and maintain a PROGRESS.md checklist.

---

## Initial Setup Prompt (Paste Once at Start)

```
Create a file called PROGRESS.md in the project root that tracks our build progress.

Use this exact structure with checkboxes. As we complete tasks, I'll ask you to mark them off.

---

# Myjoe Build Progress

> Last updated: [DATE]
> Current phase: 1
> Overall: 0/150 tasks

## Quick Stats
- [ ] Phase 1: Foundation (0/12)
- [ ] Phase 2: Authentication (0/10)
- [ ] Phase 3: Projects (0/14)
- [ ] Phase 4: AI Pipeline (0/15)
- [ ] Phase 5: Style Calibration (0/8)
- [ ] Phase 6: Generation Jobs (0/14)
- [ ] Phase 7: Hero System (0/12)
- [ ] Phase 8: Page Editor (0/14)
- [ ] Phase 9: Export (0/10)
- [ ] Phase 10: Billing (0/16)
- [ ] Phase 11: Polish (0/25)

---

## Phase 1: Foundation (Days 1-3)
**Git checkpoint:** `v0.1`

### 1.1 Project Setup
- [ ] Create Next.js 14 project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up folder structure (src/app, components, server, lib, hooks, types)
- [ ] Install core dependencies (@supabase/supabase-js, @tanstack/react-query, zustand, zod, lucide-react)
- [ ] Install build dependencies (sharp, stripe, openai, @aws-sdk/client-s3)

### 1.2 Supabase Setup
- [ ] Create Supabase project
- [ ] Run database migrations (all tables)
- [ ] Enable RLS on all tables
- [ ] Create profile trigger on auth.users
- [ ] Test RLS policies manually

### 1.3 Environment Configuration
- [ ] Create .env.local with all variables
- [ ] Add .env.local to .gitignore
- [ ] Create .env.example template

### 1.4 Design System
- [ ] Create button.tsx component
- [ ] Create input.tsx component
- [ ] Create card.tsx component
- [ ] Create skeleton.tsx component
- [ ] Create toast.tsx component
- [ ] Create tooltip.tsx component
- [ ] Set up globals.css with color variables

**Checkpoint:** [ ] Committed and tagged v0.1

---

## Phase 2: Authentication (Days 4-5)
**Git checkpoint:** `v0.2`

### 2.1 Auth Infrastructure
- [ ] Create src/lib/supabase/client.ts
- [ ] Create src/lib/supabase/server.ts
- [ ] Create src/lib/supabase/middleware.ts
- [ ] Configure Google OAuth in Supabase

### 2.2 Auth Pages
- [ ] Create /login page with Google button
- [ ] Create /login magic link form
- [ ] Create /auth/callback route
- [ ] Add error handling

### 2.3 Auth Flow Testing
- [ ] Test Google OAuth end-to-end
- [ ] Test Magic Link end-to-end
- [ ] Verify profile auto-creation
- [ ] Test protected route blocking

### 2.4 User Menu
- [ ] Create user dropdown in header
- [ ] Add sign out functionality

**Checkpoint:** [ ] Committed and tagged v0.2

---

## Phase 3: Projects (Days 6-8)
**Git checkpoint:** `v0.3`

### 3.1 Projects API
- [ ] GET /api/projects (list)
- [ ] POST /api/projects (create)
- [ ] GET /api/projects/[id]
- [ ] PATCH /api/projects/[id]
- [ ] DELETE /api/projects/[id]

### 3.2 Projects UI
- [ ] Create projects list page
- [ ] Create project card component
- [ ] Add empty state

### 3.3 Project Wizard
- [ ] Step 1: Name + page count
- [ ] Step 2: Audience selection
- [ ] Step 3: Style preset selection
- [ ] Step 4: Hero selection (optional)
- [ ] DNA derivation logic

### 3.4 Project Editor Shell
- [ ] 3-column layout
- [ ] Page thumbnails sidebar
- [ ] Selected page preview
- [ ] Header with actions

**Checkpoint:** [ ] Committed and tagged v0.3

---

## Phase 4: AI Pipeline (Days 9-13)
**Git checkpoint:** `v0.4`

### 4.1 Planner-Compiler
- [ ] Create planner-compiler.ts
- [ ] Implement system prompt
- [ ] Test JSON output parsing

### 4.2 Image Generator
- [ ] Create image-generator.ts
- [ ] GPT Image 1.5 integration
- [ ] Handle reference images
- [ ] Error handling + retries

### 4.3 Cleanup Pipeline
- [ ] Create cleanup.ts
- [ ] Sharp binarization
- [ ] Despeckle logic
- [ ] Resize to trim size

### 4.4 Quality Gate
- [ ] Create quality-gate.ts
- [ ] B&W check
- [ ] Content check
- [ ] Margin check
- [ ] Scoring logic

### 4.5 Integration
- [ ] Create generate-page.ts
- [ ] Wire full pipeline
- [ ] Test end-to-end

**Checkpoint:** [ ] Committed and tagged v0.4

---

## Phase 5: Style Calibration (Days 14-15)
**Git checkpoint:** `v0.5`

### 5.1 Calibration API
- [ ] POST /api/projects/[id]/calibrate
- [ ] POST /api/projects/[id]/calibrate/select

### 5.2 Calibration UI
- [ ] Subject input
- [ ] 4 sample grid display
- [ ] Selection interaction
- [ ] Confirmation flow

### 5.3 Integration
- [ ] Style anchor storage
- [ ] Style anchor in generation
- [ ] Test consistency

**Checkpoint:** [ ] Committed and tagged v0.5

---

## Phase 6: Generation Jobs (Days 16-18)
**Git checkpoint:** `v0.6`

### 6.1 Jobs API
- [ ] POST /api/generate (start)
- [ ] GET /api/generate/[jobId] (status)
- [ ] POST /api/generate/[jobId]/cancel

### 6.2 Job Processing
- [ ] Background worker logic
- [ ] Batch processing (3 concurrent)
- [ ] Progress updates
- [ ] Error handling per page
- [ ] Retry logic

### 6.3 Progress UI
- [ ] Job status polling
- [ ] Progress bar
- [ ] Thumbnails appearing
- [ ] Cancel button

### 6.4 R2 Storage
- [ ] Create r2-client.ts
- [ ] Upload images
- [ ] Generate thumbnails
- [ ] Signed URL generation

### 6.5 Integration
- [ ] Generate 40-page book test
- [ ] Verify storage
- [ ] Verify display

**Checkpoint:** [ ] Committed and tagged v0.6

---

## Phase 7: Hero System (Days 19-21)
**Git checkpoint:** `v0.7`

### 7.1 Hero API
- [ ] GET /api/heroes
- [ ] POST /api/heroes
- [ ] GET /api/heroes/[id]
- [ ] DELETE /api/heroes/[id]

### 7.2 Hero Generation
- [ ] Hero compiler
- [ ] Reference sheet generation
- [ ] Store reference + thumbnail

### 7.3 Hero UI
- [ ] Hero library page
- [ ] Hero creation wizard
- [ ] Approval/regenerate flow
- [ ] Hero cards

### 7.4 Hero in Generation
- [ ] Hero selector in wizard
- [ ] Hero reference in generation
- [ ] Test consistency

**Checkpoint:** [ ] Committed and tagged v0.7

---

## Phase 8: Page Editor (Days 22-24)
**Git checkpoint:** `v0.8`

### 8.1 Page API
- [ ] GET /api/pages/[id]
- [ ] POST /api/pages/[id]/edit
- [ ] POST /api/pages/[id]/restore

### 8.2 Edit Canvas
- [ ] Canvas component
- [ ] Brush tool
- [ ] Shape tools
- [ ] Size control
- [ ] Export mask

### 8.3 Edit Flow
- [ ] Chat input
- [ ] Inpaint API call
- [ ] New version creation
- [ ] Display update

### 8.4 Version History
- [ ] Version thumbnails
- [ ] Restore functionality

### 8.5 Quick Actions
- [ ] Regenerate button
- [ ] Simplify button
- [ ] Add detail button

**Checkpoint:** [ ] Committed and tagged v0.8

---

## Phase 9: Export (Days 25-26)
**Git checkpoint:** `v0.9`

### 9.1 Export API
- [ ] POST /api/export
- [ ] GET /api/export/[jobId]

### 9.2 PDF Generation
- [ ] Multi-page PDF
- [ ] Correct page size
- [ ] 300 DPI
- [ ] Proper margins

### 9.3 Download
- [ ] Signed download URL
- [ ] Download button
- [ ] Expiry handling

### 9.4 Testing
- [ ] KDP preview upload
- [ ] Verify margins
- [ ] Verify quality

**Checkpoint:** [ ] Committed and tagged v0.9

---

## Phase 10: Billing (Days 27-28)
**Git checkpoint:** `v0.10`

### 10.1 Stripe Setup
- [ ] Create products + prices
- [ ] Configure webhook endpoint
- [ ] Test in test mode

### 10.2 Checkout Flow
- [ ] POST /api/billing/checkout
- [ ] Redirect to Stripe
- [ ] Success/cancel handling

### 10.3 Webhook Handler
- [ ] checkout.session.completed
- [ ] invoice.payment_succeeded
- [ ] invoice.payment_failed
- [ ] customer.subscription.deleted

### 10.4 Blot Management
- [ ] Blot balance display
- [ ] Deduct on actions
- [ ] Cost preview modal
- [ ] Insufficient error

### 10.5 Billing UI
- [ ] Billing page
- [ ] Plan display
- [ ] Upgrade options
- [ ] Portal link

### 10.6 Testing
- [ ] Stripe CLI testing
- [ ] Upgrade flow
- [ ] Renewal
- [ ] Cancellation

**Checkpoint:** [ ] Committed and tagged v0.10

---

## Phase 11: Polish (Days 29-30)
**Git checkpoint:** `v1.0-rc1`

### 11.1 Edge Cases
- [ ] Browser close mid-generation
- [ ] Payment failure grace period
- [ ] Storage quota enforcement
- [ ] Session timeout handling

### 11.2 Empty States
- [ ] No projects
- [ ] No heroes
- [ ] No pages

### 11.3 Error States
- [ ] Generation failed
- [ ] Network error
- [ ] Rate limited

### 11.4 Loading States
- [ ] Skeleton UI everywhere
- [ ] Progress indicators

### 11.5 Analytics
- [ ] PostHog setup
- [ ] Key events tracked

### 11.6 Error Monitoring
- [ ] Sentry setup
- [ ] Error boundaries

### 11.7 Final Testing
- [ ] Full user journey
- [ ] Mobile responsive
- [ ] Cross-browser

### 11.8 Pre-Launch
- [ ] Remove console.logs
- [ ] Check env vars in Vercel
- [ ] Switch Stripe to live
- [ ] DNS configured
- [ ] Legal pages

**Checkpoint:** [ ] Committed and tagged v1.0-rc1

---

## Deployment
- [ ] Vercel project created
- [ ] GitHub connected
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL working
- [ ] Main branch deployed
- [ ] Smoke test passed

---

## Notes
<!-- Add notes, blockers, decisions here -->

```

Create this file now.
```

---

## Update Progress Prompt (Use After Completing Tasks)

```
Update PROGRESS.md:
- Mark these tasks as complete: [list tasks]
- Update the date
- Update phase counts
- Update overall count

Keep the file structure exactly the same, just change [ ] to [x] for completed items.
```

---

## Quick Update Examples

```
Update PROGRESS.md: Mark complete - "Create Next.js 14 project with TypeScript", "Configure Tailwind CSS"
```

```
Update PROGRESS.md: All of Phase 1.1 Project Setup is complete. Mark all 5 tasks done.
```

```
Update PROGRESS.md: Phase 2 is fully complete. Mark all tasks in Phase 2 as done and update the checkpoint.
```

---

## Status Check Prompt

```
Read PROGRESS.md and give me a status report:
- Current phase
- Tasks completed vs remaining
- Next 3 tasks to do
- Any blockers noted
```
