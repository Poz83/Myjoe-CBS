# Cursor Prompts - Phases 7-11

> Final phases. See CURSOR_PROMPTS.md for 1-2, PROMPTS_3-6.md for 3-6.

---

# PHASE 7: HERO SYSTEM

---

## Prompt 7.1 - Hero Generator

```
I'm building Myjoe. Phase 6 (Generation) is complete.

Create hero generation:

Create src/server/ai/hero-generator.ts:

1. compileHeroPrompt(name, description, audience): Promise<{ compiledPrompt, negativePrompt }>
   - Use GPT-4o-mini to expand description into reference sheet prompt
   - Output prompt for 2x2 grid: front, side, back, 3/4 views
   - All views identical character, coloring book style, appropriate line weight

2. generateHeroSheet(compiledPrompt): Promise<Buffer>
   - GPT Image 1.5, 1536x1536, high quality
   - Run through cleanup (keep 1536x1536)

Generate the file.
```

```bash
git add . && git commit -m "feat(7.1): hero generator"
```

---

## Prompt 7.2 - Heroes Database & API

```
I'm building Myjoe. Hero generator is done.

Create hero database and API:

1. src/server/db/heroes.ts:
- getHeroes, getHero, createHero, updateHero, deleteHero, incrementHeroUsage

2. src/app/api/heroes/route.ts:
- GET: List heroes
- POST: Start creation job (15 Blots)

3. src/app/api/heroes/[id]/route.ts:
- GET: Single hero with reference URL
- DELETE: Soft delete

4. src/server/jobs/process-hero.ts:
- processHeroJob: compile prompt, generate sheet, upload to R2, update record

Generate all files.
```

```bash
git add . && git commit -m "feat(7.2): heroes database and API"
```

---

## Prompt 7.3 - Hero UI

```
I'm building Myjoe. Hero API is done.

Create hero UI:

1. src/hooks/use-heroes.ts:
- useHeroes, useHero, useCreateHero, useDeleteHero
- Optimistic updates on create/delete

2. src/components/features/hero/hero-card.tsx:
- Card with thumbnail (aspect-square, rounded-lg)
- Name (font-medium), audience badge (text-xs pill)
- "Used in X projects" subtitle (text-zinc-400)
- Dropdown menu: Edit, Delete
- Hover: border-zinc-700, subtle scale
- Skeleton variant for loading state with shimmer

3. src/app/(studio)/library/page.tsx:
- "My Heroes" heading
- Grid of hero cards (grid-cols-2 sm:3 md:4, gap-6)
- "Create Hero" button (primary)
- Empty state: User icon, "No heroes yet", "Create your first character"
- Loading: show hero card skeletons

4. src/components/features/hero/hero-creator.tsx:
Multi-step wizard in modal or dedicated page:
- Step 1: Name input + Description textarea (rich detail helps AI)
- Step 2: Audience selection (same 5-button pattern as project wizard)
- Step 3: Preview cost (15 Blots), "Generate Reference Sheet" button
- Step 4: 2x2 grid result, "Approve" or "Try Again" buttons
- Progress indicator at top

5. src/app/(studio)/library/heroes/new/page.tsx
- Full page for hero creation wizard

Generate all files.
```

```bash
git add . && git commit -m "feat(7.3): hero UI"
```

---

## Prompt 7.4 - Hero Integration

```
I'm building Myjoe. Hero UI is done.

Integrate heroes into workflow:

1. src/components/features/hero/hero-selector.tsx:
- Modal with hero grid, search, select, "No Hero" option

2. Update project wizard step 4 to use HeroSelector

3. Update generation processor to:
- Fetch hero reference from R2 if hero_id exists
- Pass to generateSinglePage

Test full flow: create hero, create project with hero, generate pages, verify consistency.

Generate updated files.
```

```bash
git add . && git commit -m "feat(7.4): hero integration"
git tag -a v0.7 -m "Phase 7 complete: Hero System"
git push origin main --tags
```

---

# PHASE 8: PAGE EDITOR

---

## Prompt 8.1 - Page API

```
I'm building Myjoe. Phase 7 (Heroes) is complete.

Create page editing API:

1. src/app/api/pages/[id]/route.ts:
GET: Page with all versions and URLs

2. src/app/api/pages/[id]/edit/route.ts:
POST: Edit page (12 Blots)
- Types: 'regenerate', 'inpaint', 'quick_action'
- Create new version, update current_version
- Return { version, imageUrl, thumbnailUrl, blotsSpent }

3. src/app/api/pages/[id]/restore/route.ts:
POST: Restore version (free)
- Update current_version only

Generate all files.
```

```bash
git add . && git commit -m "feat(8.1): page editing API"
```

---

## Prompt 8.2 - Inpainting

```
I'm building Myjoe. Page API is done.

Create inpainting:

Create src/server/ai/inpaint.ts:

inpaintImage(options): Promise<Buffer>
- originalImage, maskImage, prompt, styleContext, heroReference?
- Use OpenAI images.edit with mask
- Run through cleanup

Also add to generate-page.ts:
applyQuickAction(originalImage, action, scenePrompt): Promise<Buffer>
- 'simplify': remove details
- 'add_detail': add patterns

Generate the file.
```

```bash
git add . && git commit -m "feat(8.2): inpainting"
```

---

## Prompt 8.3 - Edit Canvas

```
I'm building Myjoe. Inpainting is done.

Create edit canvas:

Create src/components/features/editor/edit-canvas.tsx:

Props: imageUrl, onMaskCreate, onCancel

Features:
- Image background with canvas overlay
- Tools: brush, circle, rectangle
- Size slider (10-100px)
- Clear and Done buttons
- Paint in semi-transparent pink
- Export as mask (white = edit, black = preserve)

Use HTML Canvas API, support mouse and touch.

Generate the component.
```

```bash
git add . && git commit -m "feat(8.3): edit canvas"
```

---

## Prompt 8.4 - Page Editor UI

```
I'm building Myjoe. Edit canvas is done.

Create page editor UI:

1. src/hooks/use-page-editor.ts:
- usePageDetail(pageId): Full page data with versions
- useEditPage(): Mutation with optimistic thumbnail update
- useRestoreVersion(): Mutation (free, no Blots)

2. src/components/features/editor/page-editor.tsx:
Two modes:

VIEW MODE (default):
- Large image preview (centered, zoom controls)
- Right inspector panel with accordion sections:
  - "Scene" (collapsed by default): scene brief, page type
  - "Actions" (expanded): Regenerate, Edit, Simplify, Add Detail buttons
    - Each shows Blot cost: "Regenerate · 12 🎨"
  - "Versions" (collapsed): thumbnail strip of versions, click to preview, Restore button
- Action buttons use loading state with spinner when processing

EDIT MODE (after clicking Edit):
- EditCanvas component takes full width
- Bottom bar: prompt input, "Apply Edit" button (12 Blots), Cancel
- Tool palette sticky at top

3. src/app/(studio)/projects/[id]/pages/[pageId]/page.tsx:
- Full page editor route
- Header: Back to project, page number, version indicator
- Uses page-editor component

Generate all files.
```

```bash
git add . && git commit -m "feat(8.4): page editor UI with accordions"
git tag -a v0.8 -m "Phase 8 complete: Page Editor"
git push origin main --tags
```

---

# PHASE 9: EXPORT

---

## Prompt 9.1 - PDF Generation

```
I'm building Myjoe. Phase 8 (Page Editor) is complete.

Create PDF export:

Create src/server/export/pdf-generator.ts:

npm install pdfkit archiver

1. generateInteriorPDF(project, pages): Promise<Buffer>
- Create PDF with correct page size (72 points/inch)
- Full bleed images on each page
- Return buffer

2. generateExportZip(project, pages): Promise<Buffer>
- ZIP of PNGs named page_01.png, etc.

Generate the file.
```

```bash
git add . && git commit -m "feat(9.1): PDF generation"
```

---

## Prompt 9.2 - Export API

```
I'm building Myjoe. PDF generator is done.

Create export API:

1. src/app/api/export/route.ts:
POST: Start export job (3 Blots)
- Verify project status is 'ready'

2. src/app/api/export/[jobId]/route.ts:
GET: Status with downloadUrl (signed, 1 hour expiry)

3. src/server/jobs/process-export.ts:
- Generate PDF or ZIP, upload to R2, update job

Generate all files.
```

```bash
git add . && git commit -m "feat(9.2): export API"
```

---

## Prompt 9.3 - Export UI

```
I'm building Myjoe. Export API is done.

Create export UI:

1. src/hooks/use-export.ts:
- useStartExport, useExportStatus

2. src/components/features/export/export-dialog.tsx:
- OPTIONS: Format selection (PDF/ZIP), Blot cost, Start button
- PROCESSING: Progress spinner
- READY: Download button, expiry warning

3. Add Export button to project header, opens dialog.

Generate all files.
```

```bash
git add . && git commit -m "feat(9.3): export UI"
git tag -a v0.9 -m "Phase 9 complete: Export"
git push origin main --tags
```

---

# PHASE 10: BILLING

---

## Prompt 10.1 - Stripe Setup

```
I'm building Myjoe. Phase 9 (Export) is complete.

Create Stripe integration:

Create src/server/billing/stripe.ts:

1. createCheckoutSession({ userId, email, plan, interval }): Promise<string>
- Create/get Stripe customer
- Create checkout session
- Return URL

2. createPortalSession(customerId): Promise<string>

3. getPriceId(plan, interval): string
- Map to env vars: STRIPE_PRICE_{PLAN}_{INTERVAL}

Generate the file.
```

```bash
git add . && git commit -m "feat(10.1): Stripe client"
```

---

## Prompt 10.2 - Billing API

```
I'm building Myjoe. Stripe client is done.

Create billing API:

1. src/app/api/billing/balance/route.ts:
GET: { blots, plan, resetsAt, storageUsed, storageLimit }

2. src/app/api/billing/checkout/route.ts:
POST: Create checkout session, return URL

3. src/app/api/billing/portal/route.ts:
POST: Create portal session, return URL

Generate all files.
```

```bash
git add . && git commit -m "feat(10.2): billing API"
```

---

## Prompt 10.3 - Stripe Webhook

```
I'm building Myjoe. Billing API is done.

Create webhook handler:

Create src/app/api/webhooks/stripe/route.ts:

Handle events:
1. checkout.session.completed: Update profile (plan, blots, storage)
2. invoice.payment_succeeded: RESET blots to plan amount
3. invoice.payment_failed: Set payment_failed_at
4. customer.subscription.deleted: Downgrade to free

Verify signature, return 200 quickly.

Generate the file.
```

```bash
git add . && git commit -m "feat(10.3): Stripe webhook"
```

---

## Prompt 10.4 - Blot Display

```
I'm building Myjoe. Webhook is done.

Create Blot UI:

1. src/hooks/use-blots.ts:
- useBlots(): { blots, plan, isLoading, refetch }

2. src/components/features/billing/blot-display.tsx:
- Header component with balance, color coding (low=amber, empty=red)

3. src/components/features/billing/cost-preview.tsx:
- Modal showing itemized costs, balance after, insufficient warning

4. Update header with BlotDisplay
5. Use CostPreview before all Blot-spending actions

Generate all files.
```

```bash
git add . && git commit -m "feat(10.4): Blot display"
```

---

## Prompt 10.5 - Billing Page

```
I'm building Myjoe. Blot display is done.

Create billing page:

Create src/app/(studio)/billing/page.tsx:

Sections:
A. Current plan badge, Blot balance bar, reset date, storage bar
B. Plan comparison cards (if on Free)
C. Manage Subscription button → Stripe portal (if paid)
D. Payment failed warning (if applicable)

Handle ?success and ?canceled URL params with toasts.

Generate the file.
```

```bash
git add . && git commit -m "feat(10.5): billing page"
git tag -a v0.10 -m "Phase 10 complete: Billing"
git push origin main --tags
```

---

# PHASE 11: POLISH

---

## Prompt 11.1 - Empty States

```
I'm building Myjoe. Phase 10 (Billing) is complete.

Add empty states:

1. src/components/ui/empty-state.tsx:
- Props: icon, title, description, action
- Centered layout with icon, text, button

2. Update pages with empty states:
- Projects: Book icon, "No projects yet"
- Library: User icon, "No heroes yet"
- Project editor: Image icon, "Ready to generate"

Generate the files.
```

```bash
git add . && git commit -m "feat(11.1): empty states"
```

---

## Prompt 11.2 - Loading States

```
I'm building Myjoe. Empty states done.

Add loading states following these PATTERNS:

WHEN TO USE WHAT:
- <300ms: No loader (feels instant)
- 300-500ms: Subtle spinner on button
- >500ms: Skeleton screens
- >2s: Progress bar with stages

1. Create skeleton variants with shimmer animation:
- ProjectCardSkeleton: aspect-[3/4] image + 2 text lines
- HeroCardSkeleton: aspect-square image + text
- PageThumbnailSkeleton: 80x80 rounded
- All use shimmer gradient background animation

2. Add loading.tsx files (Next.js Suspense):
- src/app/(studio)/projects/loading.tsx: Grid of ProjectCardSkeleton
- src/app/(studio)/projects/[id]/loading.tsx: 3-column layout skeleton
- src/app/(studio)/library/loading.tsx: Grid of HeroCardSkeleton
- src/app/(studio)/billing/loading.tsx: Card sections skeleton

3. Update data-fetching components:
- Show skeletons while useQuery isLoading
- Use isPlaceholderData for stale-while-revalidate feel
- Avoid layout shift: skeleton matches final content size

4. Add shimmer CSS to globals.css:
.skeleton-shimmer {
  background: linear-gradient(90deg, #1a1a1a 25%, #262626 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

Generate the files.
```

```bash
git add . && git commit -m "feat(11.2): loading states with shimmer skeletons"
```

---

## Prompt 11.3 - Error Handling

```
I'm building Myjoe. Loading states done.

Add error handling:

1. src/components/error-boundary.tsx:
- Catch errors, show friendly UI, Refresh button

2. src/app/(studio)/error.tsx:
- Next.js error page with reset

3. src/app/(studio)/not-found.tsx:
- 404 page

4. Add error toasts to all hooks on failure

5. src/lib/api-client.ts:
- Fetch wrapper with error handling

Generate the files.
```

```bash
git add . && git commit -m "feat(11.3): error handling"
```

---

## Prompt 11.4 - Edge Cases

```
I'm building Myjoe. Error handling done.

Handle edge cases:

1. Browser close during generation: Check for active jobs on load
2. Session timeout: Toast + redirect
3. Concurrent tabs: TanStack Query handles, add refetch on focus
4. Storage quota: Check before upload, block if full
5. Rate limiting: Handle 429, disable buttons
6. Payment grace period: Show banner if payment_failed_at < 3 days

Update files as needed.
```

```bash
git add . && git commit -m "feat(11.4): edge cases"
```

---

## Prompt 11.5 - Analytics

```
I'm building Myjoe. Edge cases done.

Add analytics:

1. npm install @sentry/nextjs posthog-js

2. src/lib/analytics.ts:
- PostHog init and track function

3. Track events: user_signed_up, project_created, generation_started/completed, page_edited, hero_created, export_completed, subscription_started/cancelled

4. Configure Sentry with npx @sentry/wizard@latest -i nextjs

Generate the files.
```

```bash
git add . && git commit -m "feat(11.5): analytics"
```

---

## Prompt 11.6 - Final Polish

```
I'm building Myjoe. Analytics done.

Final polish:

1. Meta tags: Update layout.tsx with title, description, OpenGraph
2. Remove console.logs
3. Accessibility: aria-labels on icon buttons, alt text
4. Mobile: Check all pages, fix overflow issues
5. Legal placeholders: /terms and /privacy pages

Generate/update files.
```

```bash
git add . && git commit -m "feat(11.6): final polish"
git tag -a v1.0-rc1 -m "Release Candidate 1"
git push origin main --tags
```

---

# DEPLOYMENT

---

## Prompt: Deploy

```
I'm deploying Myjoe.

1. Create DEPLOYMENT.md checklist:
- Pre-deploy checks
- Vercel setup steps
- Post-deploy smoke test

2. Create vercel.json with build config

3. Update .env.example with all variables

Generate the files.
```

```bash
git checkout main
git merge develop
git push origin main
git tag -a v1.0.0 -m "Production release"
git push origin main --tags
```

---

# DONE! 🎉

You've completed all prompts. Your app should be production-ready.

**Repository:** `git@github.com:Poz83/Myjoe-CBS.git`

## If You Get Stuck

```
I'm stuck on [describe issue].
Error message: [paste error]
What I expected: [describe]
What happened: [describe]

Help me fix this.
```

## To Resume After a Break

```
I'm back working on Myjoe. I completed prompt [X.X].
Continue with the next prompt.
```
