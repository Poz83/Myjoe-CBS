# OpenAI Quick Start

## ✅ OpenAI Integration Complete

All AI pipeline modules have been created and are ready to use!

---

## 📋 What Was Setup

### Created Files

```
src/server/ai/
├── openai-client.ts         ✅ OpenAI client singleton
├── planner-compiler.ts      ✅ GPT-4o-mini prompt compilation
├── image-generator.ts       ✅ DALL-E 3 image generation
├── cleanup.ts              ✅ B&W conversion, 300 DPI
├── quality-gate.ts         ✅ Automated quality checks
├── hero-generator.ts       ✅ Hero reference sheets
├── style-calibration.ts    ✅ Style anchor sampling
├── inpaint.ts             ✅ Paintbrush edits
└── index.ts               ✅ Public exports

src/types/
└── domain.ts              ✅ Core domain types

Docs/
└── OPENAI_SETUP.md        ✅ Complete documentation
```

---

## 🚀 Next Steps

### 1. Get Your OpenAI API Key

1. Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click **"Create new secret key"**
4. **Copy the key immediately** (you can't see it again!)

### 2. Add to Your Environment

Create `.env.local` in the project root:

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important:** This file is already in `.gitignore` - never commit API keys!

### 3. Test the Setup

```bash
# Start the development server
npm run dev

# The server will validate your API key on startup
# You should see no errors if the key is valid
```

---

## 💡 Example Usage

### Generate Pages for a Project

```typescript
import { planAndCompile, cleanupImage } from '@/server/ai';
import { generateWithFlux, downloadImage } from '@/server/ai/flux-generator';

// 1. Plan the book
const pages = await planAndCompile({
  userIdea: "Adventures of a space-faring cat",
  projectDNA: {
    pageCount: 40,
    trimSize: '8.5x11',
    audience: 'children',
    stylePreset: 'cartoon',
    lineWeight: 'thick',
    complexity: 'moderate',
  }
});

// 2. Generate a page with Flux
const fluxResult = await generateWithFlux({
  compiledPrompt: pages[0].compiledPrompt,
  negativePrompt: pages[0].negativePrompt,
  fluxModel: 'flux-pro',
  trimSize: '8.5x11'
});

if (!fluxResult.success) {
  throw new Error('Flux generation failed');
}

const rawImage = await downloadImage(fluxResult.imageUrl!);

// 3. Cleanup to pure B&W, 300 DPI
const finalImage = await cleanupImage(rawImage, {
  targetWidth: 2550,  // 8.5" × 300 DPI
  targetHeight: 3300, // 11" × 300 DPI
});

// 4. Store to R2 and save to database
```

### Create a Hero Character

```typescript
import { compileHeroPrompt, generateHeroSheet } from '@/server/ai';

// 1. Compile hero prompt
const prompt = await compileHeroPrompt({
  name: "Captain Whiskers",
  description: "A brave cat astronaut with orange fur and a space helmet",
  audience: 'children'
});

// 2. Generate reference sheet (2×2 grid)
const heroSheet = await generateHeroSheet(prompt);
```

---

## 💰 Cost Breakdown

| Operation | Cost |
|-----------|------|
| Plan 40 pages (GPT-4o-mini) | ~$0.003 |
| Generate 1 page (DALL-E 3 HD) | ~$0.08 |
| Style calibration (4 samples) | ~$0.16 |
| Hero reference sheet | ~$0.08 |
| Inpaint edit (DALL-E 2) | ~$0.02 |

**Total for 40-page book:** ~$3.50

---

## 🔧 Available Functions

All functions are exported from `@/server/ai`:

```typescript
// Planning
planAndCompile(input) → CompiledPage[]

// Image Generation
generateImage(options) → Buffer
generateHeroSheet(prompt) → Buffer
generateCalibrationSamples(subject, style, audience) → Buffer[]

// Image Processing
cleanupImage(buffer, options) → Buffer
qualityCheck(buffer) → QualityReport

// Editing
inpaintImage(options) → Buffer

// Hero
compileHeroPrompt(input) → string
```

---

## 📚 Full Documentation

For complete details, see:
- **[Docs/OPENAI_SETUP.md](./Docs/OPENAI_SETUP.md)** - Complete guide
- **[Docs/05_AI_PIPELINE.md](./Docs/05_AI_PIPELINE.md)** - Technical specs
- **[Docs/01_SOURCE_OF_TRUTH.md](./Docs/01_SOURCE_OF_TRUTH.md)** - Locked decisions

---

## ⚠️ Important Notes

1. **Rate Limits:** Free tier is limited to 3 RPM and 5 DALL-E requests/min
2. **Spending Limits:** Set up budget alerts at [platform.openai.com/account/billing](https://platform.openai.com/account/billing)
3. **Models:**
   - Using **DALL-E 3** for generation (not "GPT Image 1.5" from docs)
   - Using **DALL-E 2** for inpainting edits
   - Using **GPT-4o-mini** for planning

---

## 🐛 Troubleshooting

### "OPENAI_API_KEY environment variable is not set"
→ Add the key to `.env.local` and restart dev server

### "Incorrect API key provided"
→ Double-check the key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### "Rate limit exceeded"
→ Upgrade to paid tier or implement request queuing

---

## ✨ You're Ready!

OpenAI is now fully integrated. Next steps:
1. Add your API key to `.env.local`
2. Test with `npm run dev`
3. Check out `Docs/OPENAI_SETUP.md` for detailed usage
4. Set up Cloudflare R2 for image storage (see `Docs/CLOUDFLARE_R2_SETUP.md`)

**Happy generating! 🎨**
