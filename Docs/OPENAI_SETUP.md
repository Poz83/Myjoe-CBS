# OpenAI Setup Guide

## Overview

Myjoe uses OpenAI for two critical functions:
1. **GPT-4o-mini** - Planning and prompt compilation
2. **DALL-E 3** - Image generation

---

## Quick Setup

### 1. Get Your OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in or create an account
3. Navigate to **API Keys** in the left sidebar
4. Click **Create new secret key**
5. Copy the key immediately (you won't be able to see it again)

### 2. Add to Environment Variables

Create a `.env.local` file in the project root (if it doesn't exist):

```bash
# Copy from .env.example
cp .env.example .env.local
```

Add your OpenAI API key:

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Verify Setup

The OpenAI client will automatically validate the API key when the server starts. If the key is missing or invalid, you'll see an error.

---

## Cost Estimates

Based on current OpenAI pricing:

| Operation | Model | Cost per Call | Used For |
|-----------|-------|---------------|----------|
| Planning (40 pages) | GPT-4o-mini | ~$0.003 | Prompt compilation |
| Generate 1 page | DALL-E 3 HD | ~$0.08 | Image generation |
| Style calibration (4 samples) | DALL-E 3 Standard | ~$0.16 | Style anchor selection |
| Hero reference sheet | DALL-E 3 HD | ~$0.08 | Character consistency |
| Inpainting edit | DALL-E 2 | ~$0.02 | Paintbrush edits |

**Total for 40-page book:** ~$3.50 (actual cost may vary with retries)

---

## Architecture

### Module Structure

```
src/server/ai/
├── openai-client.ts         # Singleton OpenAI client
├── planner-compiler.ts      # GPT-4o-mini: Scene planning
├── image-generator.ts       # DALL-E: Image generation
├── cleanup.ts              # Post-processing (B&W, 300 DPI)
├── quality-gate.ts         # Automated quality checks
├── hero-generator.ts       # Hero reference sheet creation
├── style-calibration.ts    # Style anchor sampling
├── inpaint.ts             # Paintbrush edits
└── index.ts               # Public exports
```

### Core Functions

#### 1. Plan and Compile (`planner-compiler.ts`)

Transforms user ideas into structured prompts with enforced rules.

```typescript
import { planAndCompile } from '@/server/ai';

const pages = await planAndCompile({
  userIdea: "A wizard exploring magical forests",
  projectDNA: {
    pageCount: 40,
    trimSize: '8.5x11',
    audience: 'children',
    stylePreset: 'whimsical',
    lineWeight: 'thick',
    complexity: 'moderate',
  },
  hero: {
    name: "Wizard Wally",
    compiledPrompt: "...",
    // ... other hero fields
  }
});

// Returns: CompiledPage[]
// [
//   {
//     pageNumber: 1,
//     sceneBrief: "Wizard entering enchanted forest gate",
//     compositionType: "full-body",
//     compiledPrompt: "Coloring book page...",
//     negativePrompt: "shading, gradient..."
//   },
//   ...
// ]
```

#### 2. Generate Image (`image-generator.ts`)

Creates images using DALL-E with optional reference images.

```typescript
import { generateImage } from '@/server/ai';

const imageBuffer = await generateImage({
  prompt: compiledPage.compiledPrompt,
  negativePrompt: compiledPage.negativePrompt,
  heroReference: heroReferenceBuffer, // Optional
  styleAnchor: styleAnchorBuffer,     // Optional
  size: '1024x1024',
  quality: 'high'
});
```

#### 3. Cleanup Image (`cleanup.ts`)

Converts to pure black & white, enforces 300 DPI.

```typescript
import { cleanupImage, TRIM_SIZES } from '@/server/ai';

const cleanedBuffer = await cleanupImage(rawImageBuffer, {
  targetWidth: TRIM_SIZES['8.5x11'].width,
  targetHeight: TRIM_SIZES['8.5x11'].height,
  threshold: 128 // B&W threshold
});
```

#### 4. Quality Check (`quality-gate.ts`)

Validates image meets KDP standards.

```typescript
import { qualityCheck } from '@/server/ai';

const quality = await qualityCheck(cleanedBuffer);

if (!quality.passed) {
  console.log('Failed checks:', quality.failReasons);
  // Retry generation
}
```

#### 5. Hero Reference Sheet (`hero-generator.ts`)

Creates 2×2 grid with front, side, back, 3/4 views.

```typescript
import { compileHeroPrompt, generateHeroSheet } from '@/server/ai';

const prompt = await compileHeroPrompt({
  name: "Captain Courage",
  description: "Brave superhero with red cape and blue costume",
  audience: 'children'
});

const heroSheetBuffer = await generateHeroSheet(prompt);
```

#### 6. Style Calibration (`style-calibration.ts`)

Generates 4 style variations for user to pick anchor.

```typescript
import { generateCalibrationSamples } from '@/server/ai';

const samples = await generateCalibrationSamples(
  "A playful cat", // subject
  'kawaii',        // stylePreset
  'children'       // audience
);

// Returns: [Buffer, Buffer, Buffer, Buffer]
```

#### 7. Inpainting (`inpaint.ts`)

Targeted edits using mask image.

```typescript
import { inpaintImage } from '@/server/ai';

const editedBuffer = await inpaintImage({
  originalImage: pageBuffer,
  maskImage: maskBuffer, // White = edit, Black = preserve
  prompt: "Add a small bird on the branch",
  styleContext: project.styleAnchorDescription
});
```

---

## API Models Used

### GPT-4o-mini

- **Purpose:** Prompt planning and compilation
- **Context window:** 128K tokens
- **Response format:** JSON
- **Temperature:** 0.7 (balanced creativity)

### DALL-E 3

- **Purpose:** High-quality image generation
- **Sizes:** 1024x1024, 1024x1792, 1792x1024
- **Quality:** Standard or HD
- **Max size:** 1024x1024 (scaled up to 300 DPI in cleanup)

### DALL-E 2

- **Purpose:** Image editing with mask (inpainting)
- **Sizes:** 1024x1024
- **Features:** Supports mask for targeted edits

**Note:** The documentation references "GPT Image 1.5" which appears to be conceptual. Current implementation uses DALL-E 3 for generation and DALL-E 2 for editing.

---

## Rate Limits

OpenAI has rate limits based on your tier:

| Tier | RPM | TPM | DALL-E Requests |
|------|-----|-----|-----------------|
| Free | 3 | 40K | 5/min |
| Tier 1 | 500 | 1M | 50/min |
| Tier 2 | 5000 | 5M | 100/min |

For production, you'll need **Tier 1+** to handle multiple concurrent users.

---

## Error Handling

All AI functions include built-in error handling:

```typescript
try {
  const pages = await planAndCompile(input);
} catch (error) {
  if (error.response?.status === 429) {
    // Rate limit hit - implement retry with backoff
  } else if (error.response?.status === 401) {
    // Invalid API key
  } else {
    // Other error
  }
  throw error;
}
```

---

## Testing

To test your OpenAI setup:

```bash
# Start development server
npm run dev

# In another terminal, test the AI client
node -e "import('./src/server/ai/openai-client.ts').then(() => console.log('✅ OpenAI connected'))"
```

---

## Best Practices

1. **Never commit API keys** - Use `.env.local` (already in `.gitignore`)
2. **Monitor costs** - Check [platform.openai.com/usage](https://platform.openai.com/usage)
3. **Implement retries** - For transient failures (network, rate limits)
4. **Cache results** - Store generated images, don't regenerate
5. **Set spending limits** - Configure in OpenAI dashboard

---

## Troubleshooting

### Error: "OPENAI_API_KEY environment variable is not set"

**Solution:** Add the key to `.env.local` and restart the dev server.

### Error: "Incorrect API key provided"

**Solution:** Verify the key in [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Error: "Rate limit exceeded"

**Solution:** 
1. Upgrade to Tier 1+ for production
2. Implement exponential backoff
3. Queue requests instead of parallel

### Images have gray tones (not pure B&W)

**Solution:** The `cleanup.ts` module handles this automatically. If still seeing gray:
1. Lower the threshold in `cleanupImage` (try 100 instead of 128)
2. Check quality gate reports for `pureBlackWhite` failures

---

## Production Checklist

- [ ] OpenAI API key added to production environment variables
- [ ] Spending limits configured in OpenAI dashboard
- [ ] Rate limit handling implemented
- [ ] Error monitoring configured (Sentry)
- [ ] Image storage tested (R2)
- [ ] Quality gate thresholds tuned
- [ ] Cost tracking in analytics (PostHog)

---

## Next Steps

1. **Configure environment variables** - Fill in all values in `.env.local`
2. **Test AI pipeline** - Run a sample generation
3. **Set up storage** - Configure R2 for image storage (see `CLOUDFLARE_R2_SETUP.md`)
4. **Implement job queue** - For background processing
5. **Add monitoring** - Track costs and failures

---

## Related Documentation

- [AI Pipeline Details](./05_AI_PIPELINE.md) - Full technical specs
- [Architecture](./02_ARCHITECTURE.md) - System overview
- [Cloudflare R2 Setup](./CLOUDFLARE_R2_SETUP.md) - Image storage
- [Source of Truth](./01_SOURCE_OF_TRUTH.md) - Locked decisions
