# Cursor Prompts - Phases 7-11

> Final phases. See CURSOR_PROMPTS.md for 1-2, PROMPTS_3-6.md for 3-6.
> **UPDATED:** Includes Flux hero generation and Blot Packs

---

# PHASE 7: HERO SYSTEM

---

## Prompt 7.1 - Hero Generator (Flux)

```
I'm building Myjoe. Phase 6 (Generation) is complete.

Create hero generation using Flux:

Create src/server/ai/hero-generator.ts:

import OpenAI from 'openai';
import { generateWithFlux, downloadImage } from './flux-generator';
import { cleanupImage } from './cleanup';
import { checkContentSafety } from './content-safety';
import { FLUX_TRIGGERS, LINE_WEIGHT_PROMPTS, AUDIENCE_DERIVATIONS } from '@/lib/constants';
import type { Audience } from '@/lib/constants';

const openai = new OpenAI();

interface HeroInput {
  name: string;
  description: string;
  audience: Audience;
}

interface HeroResult {
  success: boolean;
  compiledPrompt?: string;
  negativePrompt?: string;
  imageBuffer?: Buffer;
  error?: string;
  safetyIssue?: boolean;
  suggestions?: string[];
}

export async function compileHeroPrompt(input: HeroInput): Promise<{
  compiledPrompt: string;
  negativePrompt: string;
}> {
  const { name, description, audience } = input;
  const rules = AUDIENCE_DERIVATIONS[audience];
  const linePrompt = LINE_WEIGHT_PROMPTS[rules.lineWeight];
  
  // Use GPT-4o-mini to expand description
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You create character reference sheet prompts for coloring books.

Given a character description, create a detailed prompt for a 2×2 grid showing:
- Top left: Front view
- Top right: Side view  
- Bottom left: Back view
- Bottom right: 3/4 view

The character must be:
- Coloring book style with ${rules.lineWeight} black outlines
- Age-appropriate for ${audience} (${rules.ageRange})
- Consistent across all 4 views
- Pure black lines on white background
- No shading, no gradients

Output ONLY the prompt text, nothing else.`
      },
      {
        role: 'user',
        content: `Character: ${name}\nDescription: ${description}`
      }
    ],
    temperature: 0.7,
  });
  
  const expandedDescription = response.choices[0].message.content || description;
  
  const compiledPrompt = [
    'character reference sheet',
    '2x2 grid showing front view, side view, back view, and 3/4 view',
    expandedDescription,
    'coloring book style',
    linePrompt,
    'consistent character across all views',
    'pure black outlines on white background',
    'no shading, no gradients, no gray',
  ].join(', ');
  
  const negativePrompt = [
    'shading', 'gradient', 'gray', 'color', 'photorealistic',
    '3D', 'inconsistent', 'different characters', 'blurry',
  ].join(', ');
  
  return { compiledPrompt, negativePrompt };
}

export async function generateHeroSheet(input: HeroInput): Promise<HeroResult> {
  // 1. Safety check
  const safetyResult = await checkContentSafety(input.description, input.audience);
  if (!safetyResult.safe) {
    return {
      success: false,
      error: 'Character description not suitable',
      safetyIssue: true,
      suggestions: safetyResult.suggestions,
    };
  }
  
  // 2. Compile prompt
  const { compiledPrompt, negativePrompt } = await compileHeroPrompt(input);
  
  // 3. Generate with Flux Pro (highest quality for heroes)
  const fluxTrigger = FLUX_TRIGGERS['flux-pro'].template;
  const fullPrompt = `${fluxTrigger}, ${compiledPrompt}`;
  
  const genResult = await generateWithFlux({
    compiledPrompt: fullPrompt,
    negativePrompt,
    fluxModel: 'flux-pro',
    trimSize: '8.5x8.5', // Square for reference sheet
  });
  
  if (!genResult.success) {
    return { success: false, error: genResult.error };
  }
  
  // 4. Download and cleanup
  const rawBuffer = await downloadImage(genResult.imageUrl!);
  const cleanedBuffer = await cleanupImage(rawBuffer, {
    targetWidth: 1536,
    targetHeight: 1536,
  });
  
  return {
    success: true,
    compiledPrompt,
    negativePrompt,
    imageBuffer: cleanedBuffer,
  };
}

Generate the file.
```

```bash
git add . && git commit -m "feat(7.1): hero generator with Flux"
```

---

## Prompt 7.2 - Heroes Database & API

```
I'm building Myjoe. Hero generator is done.

Create hero database and API:

1. src/server/db/heroes.ts:

Functions:
- getHeroes(userId): List all heroes
- getHero(heroId, userId): Get single hero with ownership check
- createHero(data): Create hero record
- updateHero(heroId, userId, data): Update hero
- deleteHero(heroId, userId): Soft delete
- incrementHeroUsage(heroId): Increment times_used

2. src/app/api/heroes/route.ts:

GET: List heroes
- Return array with thumbnailUrl signed

POST: Start hero creation job (15 Blots)
- Validate { name, description, audience }
- Check content safety on description
- If blocked, return 400 with suggestions
- Reserve Blots
- Create job
- Return { jobId, status, blotsReserved: 15 }

3. src/app/api/heroes/[id]/route.ts:

GET: Single hero with reference URL signed
DELETE: Soft delete

4. src/server/jobs/process-hero.ts:

processHeroJob(jobId):
- Get job and hero data
- Call generateHeroSheet
- If safety blocked, fail job with suggestions
- Upload to R2
- Update hero record
- Complete job

Generate all files.
```

```bash
git add . && git commit -m "feat(7.2): heroes database and API"
```

---

## Prompt 7.3 - Hero UI

```
I'm building Myjoe. Hero API is done.

Create hero UI with safety feedback:

1. src/hooks/use-heroes.ts:
- useHeroes(): List heroes
- useHero(id): Single hero
- useCreateHero(): Mutation
- useDeleteHero(): Mutation

2. src/components/features/hero/hero-card.tsx:
- Card with thumbnail (aspect-square, rounded-lg)
- Name (font-medium)
- Audience badge (text-xs pill)
- "Used in X projects" subtitle
- Dropdown menu: Edit, Delete
- Skeleton variant with shimmer

3. src/app/(studio)/library/page.tsx:
- "My Heroes" heading
- Grid of hero cards
- "Create Hero" button
- Empty state: User icon, "No heroes yet"
- Loading: hero card skeletons

4. src/components/features/hero/hero-creator.tsx:

Multi-step wizard:

Step 1: Name + Description
- Name input
- Description textarea (rich detail helps AI)
- Character limit indicator

Step 2: Audience
- Same 5-button pattern as project wizard
- Explains line weight/style for each

Step 3: Review + Generate
- Show summary
- Cost: 15 Blots
- "Generate Reference Sheet" button
- SAFETY FEEDBACK:
  - If description blocked, show error
  - Red border on description
  - "This description isn't suitable for [audience]"
  - Suggestions list

Step 4: Result
- Show 2×2 reference sheet
- "Approve" button (saves hero)
- "Try Again" button (re-run generation)

5. src/app/(studio)/library/heroes/new/page.tsx:
- Full page for hero creation wizard

Generate all files.
```

```bash
git add . && git commit -m "feat(7.3): hero UI with safety feedback"
```

---

## Prompt 7.4 - Hero Integration

```
I'm building Myjoe. Hero UI is done.

Integrate heroes into workflow:

1. src/components/features/hero/hero-selector.tsx:
- Modal with hero grid
- Search filter
- Select interaction
- "No Hero" option
- Selected hero preview

2. Update project wizard step 4:
- Use HeroSelector component
- Show selected hero thumbnail
- "Change" button to reopen selector

3. Update generation processor:
- Fetch hero reference from R2 if hero_id exists
- Include hero description in planner-compiler
- Pass reference to Flux (for future ControlNet)

Test full flow:
- Create hero with safe description
- Create project with hero
- Generate pages
- Verify hero appears consistently

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

GET: Page with all versions and signed URLs

2. src/app/api/pages/[id]/edit/route.ts:

POST: Edit page (12 Blots)
- Types: 'regenerate', 'inpaint', 'quick_action'
- Check content safety on edit prompt
- If blocked, return 400 with suggestions
- Create new version
- Update current_version
- Return { version, imageUrl, thumbnailUrl, blotsSpent }

3. src/app/api/pages/[id]/restore/route.ts:

POST: Restore version (free, no Blots)
- Update current_version only
- Return { currentVersion, imageUrl }

Generate all files with safety integration.
```

```bash
git add . && git commit -m "feat(8.1): page editing API"
```

---

## Prompt 8.2 - Inpainting

```
I'm building Myjoe. Page API is done.

Create inpainting with safety:

Create src/server/ai/inpaint.ts:

import { generateWithFlux, downloadImage } from './flux-generator';
import { cleanupImage } from './cleanup';
import { checkContentSafety } from './content-safety';
import type { Audience, FluxModel } from '@/lib/constants';

interface InpaintOptions {
  originalImage: Buffer;
  maskImage: Buffer;
  prompt: string;
  audience: Audience;
  fluxModel?: FluxModel;
}

interface InpaintResult {
  success: boolean;
  imageBuffer?: Buffer;
  error?: string;
  safetyIssue?: boolean;
  suggestions?: string[];
}

export async function inpaintImage(options: InpaintOptions): Promise<InpaintResult> {
  const { originalImage, maskImage, prompt, audience, fluxModel = 'flux-lineart' } = options;
  
  // Safety check on edit prompt
  const safetyResult = await checkContentSafety(prompt, audience);
  if (!safetyResult.safe) {
    return {
      success: false,
      error: 'Edit prompt not suitable',
      safetyIssue: true,
      suggestions: safetyResult.suggestions,
    };
  }
  
  // TODO: Implement actual inpainting with Flux
  // For now, regenerate with modified prompt
  // Full inpainting requires Flux ControlNet support
  
  return {
    success: false,
    error: 'Inpainting not yet implemented - use regenerate instead',
  };
}

export async function applyQuickAction(
  originalImage: Buffer,
  action: 'simplify' | 'add_detail',
  scenePrompt: string,
  audience: Audience
): Promise<InpaintResult> {
  const actionPrompts = {
    simplify: 'simplify, reduce detail, bolder shapes, fewer elements',
    add_detail: 'add decorative details, patterns, more elements',
  };
  
  const modifiedPrompt = `${scenePrompt}, ${actionPrompts[action]}`;
  
  // Safety check
  const safetyResult = await checkContentSafety(modifiedPrompt, audience);
  if (!safetyResult.safe) {
    return {
      success: false,
      error: 'Quick action resulted in unsuitable content',
      safetyIssue: true,
      suggestions: safetyResult.suggestions,
    };
  }
  
  // Regenerate with modified prompt
  // Implementation similar to generatePage
  
  return { success: true };
}

Generate the file.
```

```bash
git add . && git commit -m "feat(8.2): inpainting with safety"
```

---

## Prompt 8.3 - Edit Canvas

```
I'm building Myjoe. Inpainting is done.

Create edit canvas for mask painting:

Create src/components/features/editor/edit-canvas.tsx:

Props:
- imageUrl: string
- onMaskCreate: (maskDataUrl: string) => void
- onCancel: () => void

Features:
- Image background with canvas overlay
- Tools: brush, circle, rectangle
- Brush size slider (10-100px)
- Clear selection button
- Done button (exports mask)
- Cancel button

Paint in semi-transparent pink/red.
Export as mask (white = edit area, black = preserve).

Use HTML Canvas API.
Support mouse and touch events.
Responsive sizing.

Generate the component.
```

```bash
git add . && git commit -m "feat(8.3): edit canvas"
```

---

## Prompt 8.4 - Page Editor UI

```
I'm building Myjoe. Edit canvas is done.

Create page editor UI with safety feedback:

1. src/hooks/use-page-editor.ts:
- usePageDetail(pageId): Full page with versions
- useEditPage(): Mutation with optimistic update
- useRestoreVersion(): Mutation

2. src/components/features/editor/page-editor.tsx:

Two modes:

VIEW MODE (default):
- Large image preview (centered, zoom controls)
- Right inspector with accordion sections:
  - "Scene": scene brief, page type
  - "Actions": Regenerate, Edit, Simplify, Add Detail
    - Each shows Blot cost
  - "Versions": thumbnail strip, click to preview, Restore
- Action buttons show loading spinner when processing

EDIT MODE (after clicking Edit):
- EditCanvas takes full width
- Bottom bar:
  - Prompt input with placeholder
  - SAFETY FEEDBACK: Red border + error if blocked
  - "Apply Edit" button (12 Blots)
  - Cancel button
- Tool palette sticky at top

3. src/app/(studio)/projects/[id]/pages/[pageId]/page.tsx:
- Full page editor route
- Header: Back, page number, version indicator
- Uses page-editor component

Generate all files.
```

```bash
git add . && git commit -m "feat(8.4): page editor UI with safety"
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

npm install pdfkit archiver

Create src/server/export/pdf-generator.ts:

import PDFDocument from 'pdfkit';
import archiver from 'archiver';
import { TRIM_SIZES } from '@/lib/constants';

interface ExportInput {
  projectId: string;
  projectName: string;
  trimSize: string;
  pages: Array<{
    sortOrder: number;
    imageBuffer: Buffer;
  }>;
}

export async function generateInteriorPDF(input: ExportInput): Promise<Buffer> {
  const { trimSize, pages } = input;
  const dimensions = TRIM_SIZES[trimSize as keyof typeof TRIM_SIZES];
  
  // Convert pixels to points (72 points = 1 inch, 300 DPI)
  const widthPt = (dimensions.width / 300) * 72;
  const heightPt = (dimensions.height / 300) * 72;
  
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    const doc = new PDFDocument({
      size: [widthPt, heightPt],
      margin: 0,
    });
    
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    
    // Add each page
    pages.sort((a, b) => a.sortOrder - b.sortOrder);
    
    pages.forEach((page, index) => {
      if (index > 0) doc.addPage();
      doc.image(page.imageBuffer, 0, 0, {
        width: widthPt,
        height: heightPt,
      });
    });
    
    doc.end();
  });
}

export async function generateExportZip(input: ExportInput): Promise<Buffer> {
  const { pages, projectName } = input;
  
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);
    
    // Add each page as PNG
    pages.sort((a, b) => a.sortOrder - b.sortOrder);
    
    pages.forEach((page) => {
      const fileName = `${projectName}_page_${String(page.sortOrder).padStart(2, '0')}.png`;
      archive.append(page.imageBuffer, { name: fileName });
    });
    
    archive.finalize();
  });
}

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
- Validate { projectId, format: 'pdf' | 'png_zip' }
- Verify project status is 'ready' (has pages)
- Reserve Blots
- Create export job
- Return { jobId, status, blotsReserved: 3 }

2. src/app/api/export/[jobId]/route.ts:

GET: Export status
- Return status, progress
- If completed: downloadUrl (signed, 1 hour expiry), expiresAt, fileSize

3. src/server/jobs/process-export.ts:

processExportJob(jobId):
- Get job and project
- Fetch all page images from R2
- Generate PDF or ZIP
- Upload to R2
- Update job with download key
- Complete job

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
- useStartExport(): Mutation
- useExportStatus(jobId): Poll status

2. src/components/features/export/export-dialog.tsx:

Dialog with states:

OPTIONS:
- Format selection (PDF / ZIP)
- Format descriptions
- Blot cost: 3
- "Start Export" button

PROCESSING:
- Progress spinner
- "Preparing your files..."

READY:
- Success icon
- File size display
- "Download" button (large, primary)
- Expiry warning: "Link expires in 1 hour"

3. Add Export button to project header:
- Only enabled when project has pages
- Opens export dialog on click

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

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const SUBSCRIPTION_PRICES = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY!,
  },
  creator: {
    monthly: process.env.STRIPE_PRICE_CREATOR_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_CREATOR_YEARLY!,
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY!,
  },
};

const PACK_PRICES = {
  splash: { priceId: process.env.STRIPE_PRICE_SPLASH!, blots: 100 },
  bucket: { priceId: process.env.STRIPE_PRICE_BUCKET!, blots: 350 },
  barrel: { priceId: process.env.STRIPE_PRICE_BARREL!, blots: 1200 },
};

export async function createSubscriptionCheckout(
  userId: string,
  email: string,
  plan: 'starter' | 'creator' | 'pro',
  interval: 'monthly' | 'yearly'
): Promise<string> {
  // Get or create Stripe customer
  let customerId = await getStripeCustomerId(userId);
  
  if (!customerId) {
    const customer = await stripe.customers.create({ email, metadata: { userId } });
    customerId = customer.id;
    await saveStripeCustomerId(userId, customerId);
  }
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{
      price: SUBSCRIPTION_PRICES[plan][interval],
      quantity: 1,
    }],
    metadata: { userId, plan, interval, type: 'subscription' },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=subscription`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
  });
  
  return session.url!;
}

export async function createPackCheckout(
  userId: string,
  email: string,
  packId: 'splash' | 'bucket' | 'barrel'
): Promise<string> {
  const pack = PACK_PRICES[packId];
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    line_items: [{
      price: pack.priceId,
      quantity: 1,
    }],
    metadata: {
      userId,
      packId,
      blots: String(pack.blots),
      type: 'blot_pack',
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=pack&blots=${pack.blots}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
  });
  
  return session.url!;
}

export async function createPortalSession(customerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  });
  
  return session.url;
}

Generate the file with helper functions.
```

```bash
git add . && git commit -m "feat(10.1): Stripe client with packs"
```

---

## Prompt 10.2 - Billing API

```
I'm building Myjoe. Stripe client is done.

Create billing API:

1. src/app/api/billing/balance/route.ts:

GET: Current balance and plan info
- Return { blots, plan, resetsAt, storageUsed, storageLimit }

2. src/app/api/billing/checkout/route.ts:

POST: Create subscription checkout
- Validate { plan, interval }
- Call createSubscriptionCheckout
- Return { url }

3. src/app/api/billing/portal/route.ts:

POST: Create Stripe portal session
- Get user's Stripe customer ID
- Call createPortalSession
- Return { url }

4. src/app/api/billing/pack-checkout/route.ts:

POST: Create pack checkout
- Validate { packId: 'splash' | 'bucket' | 'barrel' }
- Call createPackCheckout
- Return { url }

Generate all files.
```

```bash
git add . && git commit -m "feat(10.2): billing API with packs"
```

---

## Prompt 10.3 - Stripe Webhook

```
I'm building Myjoe. Billing API is done.

Create webhook handler for subscriptions AND packs:

Create src/app/api/webhooks/stripe/route.ts:

import { stripe } from '@/server/billing/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { PLAN_LIMITS } from '@/lib/constants';
import type Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed');
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  const supabase = createAdminClient();
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Handle Blot Pack purchase
      if (session.metadata?.type === 'blot_pack') {
        const { userId, packId, blots } = session.metadata;
        
        // Add blots
        await supabase.rpc('add_blots', {
          p_user_id: userId,
          p_amount: parseInt(blots),
        });
        
        // Record purchase
        await supabase.from('blot_purchases').insert({
          owner_id: userId,
          pack_id: packId,
          blots: parseInt(blots),
          price_cents: session.amount_total!,
          stripe_session_id: session.id,
        });
        
        break;
      }
      
      // Handle subscription checkout
      const { userId, plan } = session.metadata!;
      const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];
      
      await supabase
        .from('profiles')
        .update({
          plan,
          blots: limits.blots,
          storage_limit_bytes: limits.storageBytes,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          blots_reset_at: getNextResetDate(),
        })
        .eq('owner_id', userId);
      
      break;
    }
    
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      
      // Skip if not a subscription renewal
      if (invoice.billing_reason !== 'subscription_cycle') break;
      
      const customerId = invoice.customer as string;
      
      // Get user
      const { data: profile } = await supabase
        .from('profiles')
        .select('owner_id, plan')
        .eq('stripe_customer_id', customerId)
        .single();
      
      if (!profile) break;
      
      // Reset blots to plan amount
      const limits = PLAN_LIMITS[profile.plan as keyof typeof PLAN_LIMITS];
      
      await supabase
        .from('profiles')
        .update({
          blots: limits.blots,
          blots_reset_at: getNextResetDate(),
          payment_failed_at: null,
        })
        .eq('owner_id', profile.owner_id);
      
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      
      await supabase
        .from('profiles')
        .update({ payment_failed_at: new Date().toISOString() })
        .eq('stripe_customer_id', customerId);
      
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      // Downgrade to free
      await supabase
        .from('profiles')
        .update({
          plan: 'free',
          blots: PLAN_LIMITS.free.blots,
          storage_limit_bytes: PLAN_LIMITS.free.storageBytes,
          stripe_subscription_id: null,
        })
        .eq('stripe_customer_id', customerId);
      
      break;
    }
  }
  
  return Response.json({ received: true });
}

function getNextResetDate(): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toISOString();
}

Generate the file.
```

```bash
git add . && git commit -m "feat(10.3): Stripe webhook with packs"
```

---

## Prompt 10.4 - Blot Display

```
I'm building Myjoe. Webhook is done.

Create Blot UI components:

1. src/hooks/use-blots.ts:
- useBlots(): { blots, plan, isLoading, refetch }
- Poll balance every 30 seconds

2. src/components/features/billing/blot-display.tsx:
- Header component showing balance
- Color coding:
  - Normal: text-zinc-100
  - Low (<50): text-amber-500
  - Empty (0): text-red-500
- Optional emoji: 🎨

3. src/components/features/billing/cost-preview.tsx:
- Modal showing:
  - Action name
  - Cost in Blots
  - Current balance
  - Balance after
  - Warning if insufficient
- "Confirm" and "Cancel" buttons

4. src/components/features/billing/low-blots-banner.tsx:
- Show when blots < 50
- Warning icon
- "Running low on Blots"
- "Buy Pack" link | "Upgrade Plan" link

5. Update header with BlotDisplay
6. Use CostPreview before all Blot-spending actions

Generate all files.
```

```bash
git add . && git commit -m "feat(10.4): Blot display components"
```

---

## Prompt 10.5 - Blot Packs UI

```
I'm building Myjoe. Blot display is done.

Create Blot Packs purchase UI:

1. src/components/features/billing/blot-pack-selector.tsx:

const PACKS = [
  { id: 'splash', name: 'Splash', emoji: '💧', blots: 100, price: 4 },
  { id: 'bucket', name: 'Bucket', emoji: '🪣', blots: 350, price: 12, popular: true },
  { id: 'barrel', name: 'Barrel', emoji: '🛢️', blots: 1200, price: 35, bestValue: true },
];

Display:
- 3-column grid
- Each card:
  - Emoji (large)
  - Pack name
  - Blots count (large, blue)
  - Price button
- "Popular" badge on Bucket
- "Best Value" badge on Barrel

On click: POST to /api/billing/pack-checkout, redirect to Stripe

2. Update billing page to include:
- Section header: "Need More Blots?"
- Subtext: "One-time purchases • Never expire"
- BlotPackSelector component

3. Handle success URL params:
- ?success=pack&blots=X
- Show toast: "Added X Blots to your account!"

Generate all files.
```

```bash
git add . && git commit -m "feat(10.5): Blot Packs UI"
```

---

## Prompt 10.6 - Billing Page

```
I'm building Myjoe. Blot Packs UI is done.

Create complete billing page:

Create src/app/(studio)/billing/page.tsx:

Sections:

A. Current Plan Card
- Plan name badge
- Blot balance with progress bar
- Reset date
- Storage used / limit with progress bar

B. Subscription Plans (if on Free)
- 3 plan cards: Starter, Creator, Pro
- Features list for each
- Monthly/Yearly toggle
- "Upgrade" buttons

C. Manage Subscription (if on paid plan)
- "Manage Subscription" button → Stripe portal
- Cancel option note

D. Blot Packs Section
- BlotPackSelector component
- Positioned below plans

E. Payment Failed Warning (if applicable)
- Red alert box
- "Update payment method" link
- Grace period countdown

Handle URL params:
- ?success=subscription → "Welcome to [plan]!" toast
- ?success=pack&blots=X → "Added X Blots!" toast
- ?canceled=true → (no message, just redirect back)

Generate the file.
```

```bash
git add . && git commit -m "feat(10.6): billing page"
git tag -a v0.10 -m "Phase 10 complete: Billing with Packs"
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

Props:
- icon: LucideIcon
- title: string
- description: string
- action?: { label: string; href?: string; onClick?: () => void }

Centered layout with:
- Icon in bg-zinc-800 circle
- Title (font-medium)
- Description (text-zinc-400)
- Action button (primary)

2. Update pages with empty states:
- Projects: Book icon, "No projects yet", "Create your first coloring book"
- Library: User icon, "No heroes yet", "Create your first character"
- Project editor (no pages): Image icon, "Ready to generate", "Describe your book idea"

Generate the files.
```

```bash
git add . && git commit -m "feat(11.1): empty states"
```

---

## Prompt 11.2 - Loading States

```
I'm building Myjoe. Empty states done.

Add loading states with shimmer:

1. Create skeleton variants:
- ProjectCardSkeleton: aspect-[3/4] image + 2 text lines
- HeroCardSkeleton: aspect-square image + text
- PageThumbnailSkeleton: 80x80 rounded

All use shimmer gradient animation.

2. Add loading.tsx files:
- src/app/(studio)/projects/loading.tsx: Grid of ProjectCardSkeleton
- src/app/(studio)/projects/[id]/loading.tsx: 3-column layout skeleton
- src/app/(studio)/library/loading.tsx: Grid of HeroCardSkeleton
- src/app/(studio)/billing/loading.tsx: Card sections skeleton

3. Add shimmer CSS to globals.css:
.skeleton-shimmer {
  background: linear-gradient(90deg, #1a1a1a 25%, #262626 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

Generate the files.
```

```bash
git add . && git commit -m "feat(11.2): loading states with shimmer"
```

---

## Prompt 11.3 - Error Handling

```
I'm building Myjoe. Loading states done.

Add error handling:

1. src/components/error-boundary.tsx:
- Catch errors
- Show friendly UI
- "Something went wrong"
- Refresh button

2. src/app/(studio)/error.tsx:
- Next.js error page
- Reset button

3. src/app/(studio)/not-found.tsx:
- 404 page
- "Page not found"
- Back to projects link

4. Add error toasts to all hooks:
- Show toast on mutation errors
- Include error message

5. src/lib/api-client.ts:
- Fetch wrapper
- Automatic error handling
- Response type inference

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

1. Browser close during generation:
- Check for active jobs on page load
- Show "In Progress" indicator
- Resume polling

2. Session timeout:
- Detect 401 responses
- Show toast
- Redirect to login with return URL

3. Concurrent tabs:
- TanStack Query handles sync
- Add refetchOnFocus: true

4. Storage quota:
- Check before upload
- Show upgrade prompt if full

5. Rate limiting:
- Handle 429 responses
- Disable buttons temporarily
- Show retry countdown

6. Payment grace period:
- If payment_failed_at < 3 days ago
- Show warning banner
- Still allow access

Update relevant files.
```

```bash
git add . && git commit -m "feat(11.4): edge cases"
```

---

## Prompt 11.5 - Analytics

```
I'm building Myjoe. Edge cases done.

Add analytics:

npm install @sentry/nextjs posthog-js

1. src/lib/analytics.ts:
- PostHog init
- track(event, properties) function

2. Track events:
- user_signed_up
- project_created
- generation_started
- generation_completed
- generation_safety_blocked (NEW)
- page_edited
- hero_created
- hero_safety_blocked (NEW)
- export_completed
- subscription_started
- subscription_cancelled
- blot_pack_purchased (NEW)

3. Configure Sentry:
- npx @sentry/wizard@latest -i nextjs
- Set up error boundaries

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

1. Meta tags in layout.tsx:
- Title: "Myjoe - AI Coloring Book Studio"
- Description
- OpenGraph image
- Favicon

2. Code cleanup:
- Remove console.logs
- Add missing TypeScript types
- Fix any lint errors

3. Accessibility:
- aria-labels on icon buttons
- alt text on images
- Focus states visible
- Keyboard navigation

4. Mobile responsive:
- Test all pages
- Fix overflow issues
- Touch targets 44px+

5. Legal pages:
- /terms placeholder
- /privacy placeholder

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
- Environment variables list
- Stripe live mode switch
- DNS configuration
- Post-deploy smoke test

2. Create vercel.json with build config

3. Verify .env.example has ALL variables including:
- REPLICATE_API_TOKEN
- FLUX_MODEL
- STRIPE_PRICE_SPLASH
- STRIPE_PRICE_BUCKET
- STRIPE_PRICE_BARREL

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

You've completed all prompts with:
- ✅ Flux image generation (67% cheaper)
- ✅ Multi-layer content safety
- ✅ Audience-specific guardrails
- ✅ Blot Packs one-time purchases
- ✅ Post-generation safety scanning

**Repository:** `git@github.com:Poz83/Myjoe-CBS.git`

## Quick Reference

### Safety Testing
```
Toddler: "scary monster" → BLOCKED
Children: "zombie attack" → BLOCKED
Adult: "gothic skull" → ALLOWED
```

### Flux Models
```
flux-lineart: $0.013/image (production)
flux-dev-lora: $0.025/image (custom style)
flux-pro: $0.040/image (hero sheets)
```

### Blot Packs
```
Splash: 100 Blots / $5
Bucket: 300 Blots / $12
Barrel: 1000 Blots / $35
```
