# Content Safety

## Overview

Myjoe implements multi-layer content safety to ensure generated coloring book pages are appropriate for their target audience, especially critical for children's content.

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT SAFETY PIPELINE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  USER INPUT                                                     │
│      │                                                          │
│      ▼                                                          │
│  ┌─────────────────┐                                            │
│  │ Layer 1: Sanitize│  Strip special chars, normalize           │
│  └────────┬────────┘                                            │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ Layer 2: Blocklist│  Instant keyword check (FREE)            │
│  └────────┬────────┘                                            │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ Layer 3: Moderation│  OpenAI Moderation API (FREE)           │
│  └────────┬────────┘                                            │
│           ▼                                                      │
│      ┌────┴────┐                                                │
│      │ BLOCKED │ → Return suggestions                           │
│      └────┬────┘                                                │
│           │ PASS                                                 │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ GENERATE IMAGE  │  Flux via Replicate                        │
│  └────────┬────────┘                                            │
│           ▼                                                      │
│  ┌─────────────────────────────┐                                │
│  │ Layer 4: Post-Gen Scan      │  GPT-4V (Toddler/Children ONLY)│
│  └────────┬────────────────────┘                                │
│           ▼                                                      │
│      ┌────┴────┐                                                │
│      │ FLAGGED │ → Auto-retry with modified prompt              │
│      └────┬────┘                                                │
│           │ PASS                                                 │
│           ▼                                                      │
│       ✅ SAFE                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Safety Thresholds by Audience

### OpenAI Moderation Categories

| Category | Toddler | Children | Tween | Teen | Adult |
|----------|---------|----------|-------|------|-------|
| `violence` | 0.05 | 0.10 | 0.20 | 0.30 | 0.50 |
| `violence/graphic` | 0.01 | 0.05 | 0.10 | 0.20 | 0.40 |
| `sexual` | 0.01 | 0.05 | 0.10 | 0.15 | 0.30 |
| `sexual/minors` | **0.01** | **0.01** | **0.01** | **0.01** | **0.01** |
| `harassment` | 0.05 | 0.10 | 0.20 | 0.30 | 0.50 |
| `hate` | 0.01 | 0.05 | 0.10 | 0.20 | 0.30 |
| `self-harm` | 0.01 | 0.01 | 0.05 | 0.10 | 0.20 |

**CRITICAL:** `sexual/minors` is ALWAYS 0.01 regardless of audience.

---

## Layer 1: Input Sanitization

```typescript
// src/server/ai/content-safety.ts

export function sanitizeInput(text: string): string {
  return text
    // Remove potential prompt injection
    .replace(/\[.*?\]/g, '')
    .replace(/\{.*?\}/g, '')
    // Remove special unicode
    .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
    // Limit length
    .slice(0, 1000);
}
```

---

## Layer 2: Keyword Blocklist

Instant, free check before any API calls.

### Blocklist Categories

```typescript
// src/lib/constants/forbidden-content.ts

export const FORBIDDEN_CONTENT = {
  // Always blocked (all audiences)
  universal: [
    'nude', 'naked', 'nsfw', 'xxx', 'porn',
    'gore', 'blood', 'kill', 'murder', 'death',
    'drug', 'cocaine', 'heroin', 'meth',
    'weapon', 'gun', 'knife', 'sword', 'bomb',
    'alcohol', 'beer', 'wine', 'drunk',
    'cigarette', 'smoke', 'vape',
  ],
  
  // Additional blocks for children (toddler, children, tween)
  children: [
    'scary', 'monster', 'zombie', 'skeleton', 'ghost',
    'devil', 'demon', 'witch', 'evil',
    'fight', 'punch', 'kick', 'attack',
    'blood', 'wound', 'injury',
    'sad', 'crying', 'angry', 'rage',
  ],
  
  // Additional blocks for toddler only
  toddler: [
    'fire', 'flames', 'burning',
    'snake', 'spider', 'bat',
    'storm', 'lightning', 'thunder',
    'broken', 'crashed', 'destroyed',
    'lost', 'alone', 'dark',
  ],
};

export function checkBlocklist(
  text: string, 
  audience: Audience
): string[] {
  const lowerText = text.toLowerCase();
  const blocked: string[] = [];
  
  // Always check universal
  for (const word of FORBIDDEN_CONTENT.universal) {
    if (lowerText.includes(word)) {
      blocked.push(word);
    }
  }
  
  // Check children-specific for appropriate audiences
  if (['toddler', 'children', 'tween'].includes(audience)) {
    for (const word of FORBIDDEN_CONTENT.children) {
      if (lowerText.includes(word)) {
        blocked.push(word);
      }
    }
  }
  
  // Check toddler-specific
  if (audience === 'toddler') {
    for (const word of FORBIDDEN_CONTENT.toddler) {
      if (lowerText.includes(word)) {
        blocked.push(word);
      }
    }
  }
  
  return blocked;
}
```

---

## Layer 3: OpenAI Moderation API

Free, fast content moderation.

```typescript
// src/server/ai/content-safety.ts

import OpenAI from 'openai';

const openai = new OpenAI();

export const SAFETY_THRESHOLDS: Record<Audience, Record<string, number>> = {
  toddler: {
    'violence': 0.05,
    'violence/graphic': 0.01,
    'sexual': 0.01,
    'sexual/minors': 0.01,
    'harassment': 0.05,
    'hate': 0.01,
    'self-harm': 0.01,
  },
  children: {
    'violence': 0.10,
    'violence/graphic': 0.05,
    'sexual': 0.05,
    'sexual/minors': 0.01,
    'harassment': 0.10,
    'hate': 0.05,
    'self-harm': 0.01,
  },
  tween: {
    'violence': 0.20,
    'violence/graphic': 0.10,
    'sexual': 0.10,
    'sexual/minors': 0.01,
    'harassment': 0.20,
    'hate': 0.10,
    'self-harm': 0.05,
  },
  teen: {
    'violence': 0.30,
    'violence/graphic': 0.20,
    'sexual': 0.15,
    'sexual/minors': 0.01,
    'harassment': 0.30,
    'hate': 0.20,
    'self-harm': 0.10,
  },
  adult: {
    'violence': 0.50,
    'violence/graphic': 0.40,
    'sexual': 0.30,
    'sexual/minors': 0.01,
    'harassment': 0.50,
    'hate': 0.30,
    'self-harm': 0.20,
  },
};

export async function checkModeration(
  text: string,
  audience: Audience
): Promise<ModerationResult> {
  const response = await openai.moderations.create({ input: text });
  const result = response.results[0];
  const thresholds = SAFETY_THRESHOLDS[audience];
  
  const violations: string[] = [];
  
  for (const [category, score] of Object.entries(result.category_scores)) {
    const threshold = thresholds[category];
    if (threshold !== undefined && score > threshold) {
      violations.push(category);
    }
  }
  
  return {
    safe: violations.length === 0,
    violations,
    scores: result.category_scores,
  };
}
```

---

## Layer 4: Post-Generation Visual Scan

**Only for Toddler and Children audiences.**

Uses GPT-4V to analyze the generated image for inappropriate content that may have slipped through text-based filters.

```typescript
// src/server/ai/image-safety-check.ts

const SAFETY_PROMPT = `You are a content safety reviewer for children's coloring books.

Analyze this image and determine if it is appropriate for a {audience} coloring book.

Check for:
1. Violence or scary imagery
2. Inappropriate body exposure
3. Weapons or dangerous objects
4. Frightening creatures or expressions
5. Adult themes or situations
6. Blood, injuries, or death
7. Fire, explosions, or destruction
8. Anything that could frighten a young child

Respond with ONLY a JSON object:
{
  "safe": true/false,
  "issues": ["list of issues if any"],
  "severity": "none" | "low" | "medium" | "high"
}`;

export async function checkImageSafety(
  imageBuffer: Buffer,
  audience: 'toddler' | 'children'
): Promise<ImageSafetyResult> {
  const base64 = imageBuffer.toString('base64');
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: SAFETY_PROMPT.replace('{audience}', audience),
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${base64}`,
            },
          },
        ],
      },
    ],
    max_tokens: 200,
  });
  
  const content = response.choices[0].message.content || '';
  
  try {
    const result = JSON.parse(content);
    return {
      safe: result.safe === true,
      issues: result.issues || [],
      severity: result.severity || 'none',
    };
  } catch {
    // If parsing fails, treat as unsafe
    return {
      safe: false,
      issues: ['Failed to parse safety check'],
      severity: 'high',
    };
  }
}
```

---

## Complete Safety Check Flow

```typescript
// src/server/ai/content-safety.ts

export interface SafetyResult {
  safe: boolean;
  reason?: string;
  blockedKeywords?: string[];
  violations?: string[];
  suggestions?: string[];
}

export async function checkContentSafety(
  input: string,
  audience: Audience
): Promise<SafetyResult> {
  // Layer 1: Sanitize
  const sanitized = sanitizeInput(input);
  
  // Layer 2: Blocklist (instant, free)
  const blockedKeywords = checkBlocklist(sanitized, audience);
  if (blockedKeywords.length > 0) {
    return {
      safe: false,
      reason: `Contains inappropriate content for ${audience}`,
      blockedKeywords,
      suggestions: SAFE_SUGGESTIONS[audience],
    };
  }
  
  // Layer 3: OpenAI Moderation (free)
  const moderation = await checkModeration(sanitized, audience);
  if (!moderation.safe) {
    return {
      safe: false,
      reason: `Content flagged for: ${moderation.violations.join(', ')}`,
      violations: moderation.violations,
      suggestions: SAFE_SUGGESTIONS[audience],
    };
  }
  
  return { safe: true };
}
```

---

## Safe Suggestions by Audience

When content is blocked, provide helpful alternatives:

```typescript
// src/lib/constants/forbidden-content.ts

export const SAFE_SUGGESTIONS: Record<Audience, string[]> = {
  toddler: [
    'Cute animals playing in a garden',
    'Smiling sun and rainbow',
    'Teddy bears having a picnic',
    'Butterflies and flowers',
    'Baby animals with their parents',
    'Colorful balloons floating',
    'Happy farm animals',
    'Friendly fish swimming',
  ],
  children: [
    'Brave explorer in a jungle',
    'Princess in a magical castle',
    'Friendly dragon in a meadow',
    'Space adventure with planets',
    'Underwater world with dolphins',
    'Treehouse adventure',
    'Race cars on a track',
    'Fairy in an enchanted garden',
  ],
  tween: [
    'Fantasy landscape with mountains',
    'Steampunk airship adventure',
    'Mystical forest creatures',
    'Ocean voyage with ships',
    'Ancient temple exploration',
    'City skyline at sunset',
    'Wild horses running free',
    'Enchanted library scene',
  ],
  teen: [
    'Detailed mandala patterns',
    'Intricate botanical illustrations',
    'Architectural landmarks',
    'Fantasy battle scenes (non-graphic)',
    'Mythological creatures',
    'Surreal dreamscapes',
    'Cosmic space scenes',
    'Vintage automotive designs',
  ],
  adult: [
    'Complex geometric patterns',
    'Detailed cityscapes',
    'Intricate floral designs',
    'Architectural studies',
    'Abstract expressionist patterns',
    'Detailed wildlife portraits',
    'Classic art reproductions',
    'Zentangle-style patterns',
  ],
};
```

---

## Safety Feedback UI

When content is blocked, show a helpful modal:

```typescript
// src/components/features/safety/safety-feedback.tsx

interface SafetyFeedbackProps {
  result: SafetyResult;
  onTryAgain: (suggestion: string) => void;
  onClose: () => void;
}

export function SafetyFeedback({ result, onTryAgain, onClose }: SafetyFeedbackProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Content Adjustment Needed
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            {result.reason}
          </p>
          
          {result.blockedKeywords && (
            <div className="text-sm">
              <span className="text-zinc-500">Flagged terms: </span>
              <span className="text-red-400">
                {result.blockedKeywords.join(', ')}
              </span>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Try one of these instead:</p>
            <div className="grid grid-cols-2 gap-2">
              {result.suggestions?.slice(0, 4).map((suggestion, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => onTryAgain(suggestion)}
                  className="text-left justify-start h-auto py-2"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Post-Generation Retry Logic

If an image fails the post-gen safety check, automatically retry with a modified prompt:

```typescript
// src/server/ai/hero-generator.ts (example)

async function generateWithSafetyRetry(
  prompt: string,
  audience: Audience,
  maxRetries = 2
): Promise<Buffer> {
  let currentPrompt = prompt;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Generate image
    const image = await generateWithFlux(currentPrompt, { model: 'lineart' });
    
    // Skip safety check for non-children audiences
    if (!['toddler', 'children'].includes(audience)) {
      return image;
    }
    
    // Check image safety
    const safetyCheck = await checkImageSafety(image, audience);
    
    if (safetyCheck.safe) {
      return image;
    }
    
    if (attempt < maxRetries) {
      // Modify prompt and retry
      currentPrompt = modifyPromptForSafety(currentPrompt, safetyCheck.issues);
      logger.warn('Image safety retry', { attempt, issues: safetyCheck.issues });
    }
  }
  
  throw new Error('Failed to generate safe image after retries');
}

function modifyPromptForSafety(prompt: string, issues: string[]): string {
  let modified = prompt;
  
  // Add safety reinforcement
  modified += ', child-friendly, cute, happy, non-threatening';
  
  // Address specific issues
  if (issues.some(i => i.includes('scary'))) {
    modified += ', not scary, friendly expression, warm colors';
  }
  if (issues.some(i => i.includes('weapon'))) {
    modified += ', no weapons, peaceful scene';
  }
  if (issues.some(i => i.includes('violence'))) {
    modified += ', no violence, gentle interaction';
  }
  
  return modified;
}
```

---

## Safety Logging

Log all safety decisions for monitoring:

```typescript
// src/server/ai/content-safety.ts

interface SafetyLog {
  timestamp: Date;
  userId: string;
  input: string;
  audience: Audience;
  result: 'pass' | 'blocked';
  blockedKeywords?: string[];
  violations?: string[];
  moderationScores?: Record<string, number>;
}

export function logSafetyCheck(log: SafetyLog): void {
  // Log to application monitoring
  logger.info('Safety check', {
    userId: log.userId,
    audience: log.audience,
    result: log.result,
    blockedKeywords: log.blockedKeywords,
    violations: log.violations,
  });
  
  // Track in analytics
  posthog.capture('safety_check', {
    audience: log.audience,
    result: log.result,
    had_blocked_keywords: (log.blockedKeywords?.length || 0) > 0,
    had_moderation_violations: (log.violations?.length || 0) > 0,
  });
  
  // If blocked, track for review
  if (log.result === 'blocked') {
    posthog.capture('safety_blocked', {
      audience: log.audience,
      blockedKeywords: log.blockedKeywords,
      violations: log.violations,
    });
  }
}
```

---

## Configuration via global_config

Safety thresholds can be adjusted via database:

```sql
INSERT INTO global_config (key, value, description) VALUES
  ('safety_thresholds', '{
    "toddler": {"violence": 0.05, "sexual": 0.01},
    "children": {"violence": 0.10, "sexual": 0.05},
    "tween": {"violence": 0.20, "sexual": 0.10},
    "teen": {"violence": 0.30, "sexual": 0.15},
    "adult": {"violence": 0.50, "sexual": 0.30}
  }', 'Moderation thresholds by audience'),
  
  ('safety_enabled', 'true', 'Master safety switch'),
  
  ('post_gen_scan_enabled', 'true', 'Enable GPT-4V post-generation scan');
```

```typescript
// Fetch from config
export async function getSafetyConfig(): Promise<SafetyConfig> {
  const supabase = createServiceClient();
  
  const { data } = await supabase
    .from('global_config')
    .select('key, value')
    .in('key', ['safety_thresholds', 'safety_enabled', 'post_gen_scan_enabled']);
  
  return {
    enabled: data?.find(d => d.key === 'safety_enabled')?.value === 'true',
    postGenScanEnabled: data?.find(d => d.key === 'post_gen_scan_enabled')?.value === 'true',
    thresholds: data?.find(d => d.key === 'safety_thresholds')?.value || SAFETY_THRESHOLDS,
  };
}
```

---

## Testing Safety

### Unit Tests

```typescript
// __tests__/content-safety.test.ts

describe('Content Safety', () => {
  describe('checkBlocklist', () => {
    it('blocks universal forbidden words', () => {
      expect(checkBlocklist('a nude person', 'adult')).toContain('nude');
    });
    
    it('blocks children-specific words for children', () => {
      expect(checkBlocklist('scary monster', 'children')).toContain('scary');
    });
    
    it('allows children-specific words for adults', () => {
      expect(checkBlocklist('scary monster', 'adult')).toHaveLength(0);
    });
    
    it('blocks toddler-specific words for toddlers', () => {
      expect(checkBlocklist('snake in grass', 'toddler')).toContain('snake');
    });
  });
  
  describe('sanitizeInput', () => {
    it('removes prompt injection attempts', () => {
      expect(sanitizeInput('Draw [ignore previous] a cat')).toBe('Draw a cat');
    });
    
    it('limits length', () => {
      const long = 'a'.repeat(2000);
      expect(sanitizeInput(long).length).toBe(1000);
    });
  });
});
```

### Manual Testing Checklist

```
✅ Toddler audience
  □ "cute bunny" → PASS
  □ "scary monster" → BLOCKED (blocklist)
  □ "snake in grass" → BLOCKED (toddler-specific)
  □ "fire truck with flames" → BLOCKED (toddler-specific)

✅ Children audience
  □ "dragon flying" → PASS
  □ "zombie attack" → BLOCKED (blocklist)
  □ "princess castle" → PASS
  □ "knife fight" → BLOCKED (universal)

✅ Teen audience
  □ "battle scene" → PASS
  □ "fantasy warrior" → PASS
  □ "explicit content" → BLOCKED (moderation)

✅ Adult audience
  □ "complex mandala" → PASS
  □ "horror scene" → PASS
  □ "nude figure" → BLOCKED (universal)
```

---

## Cost Analysis

| Layer | Cost | Speed |
|-------|------|-------|
| Sanitization | FREE | <1ms |
| Blocklist | FREE | <1ms |
| OpenAI Moderation | FREE | ~200ms |
| GPT-4V Scan | ~$0.01 | ~2s |

**Total cost for toddler/children:** ~$0.01 per image (GPT-4V scan)
**Total cost for tween/teen/adult:** FREE (no post-gen scan)
