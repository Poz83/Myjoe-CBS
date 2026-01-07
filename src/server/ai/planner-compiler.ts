import OpenAI from 'openai';
import { checkContentSafety } from './content-safety';
import { sanitizePrompt, validateIdea } from './sanitize';
import { 
  AUDIENCE_DERIVATIONS, 
  FLUX_TRIGGERS, 
  LINE_WEIGHT_PROMPTS, 
  COMPLEXITY_PROMPTS,
} from '@/lib/constants';
import { FORBIDDEN_BY_AUDIENCE } from '@/lib/constants/forbidden-content';
import type { Audience, StylePreset, FluxModel } from '@/lib/constants';

const openai = new OpenAI();

// Full system prompt - see 05_AI_PIPELINE.md for complete version
const SYSTEM_PROMPT = `You are a professional coloring book page planner for KDP publishers.

CRITICAL: Every prompt MUST start with the trigger: {fluxTrigger}

Create {pageCount} distinct, age-appropriate coloring book pages.

RULES:
- Start every prompt with: {fluxTrigger}
- Pure black outlines on pure white background
- {lineWeight} line weight: {lineWeightDescription}
- {complexity} complexity: {complexityDescription}
- No shading, gradients, gray tones, or fills
- All shapes must be CLOSED (suitable for coloring)
- Margin-safe composition (10% padding)
- No text, watermarks, signatures

AUDIENCE: {audience} (ages {ageRange})
SAFETY: {safetyLevel}
FORBIDDEN: {forbiddenContent}
MAX ELEMENTS: {maxElements}

HERO (if provided): {heroDescription}

OUTPUT JSON ONLY:
{
  "pages": [
    {
      "pageNumber": 1,
      "sceneBrief": "Short description",
      "compositionType": "full-body",
      "compiledPrompt": "{fluxTrigger}, [detailed prompt]...",
      "negativePrompt": "{negativePrompt}"
    }
  ]
}`;

interface PlannerInput {
  userIdea: string;
  pageCount: number;
  audience: Audience;
  stylePreset: StylePreset;
  lineWeight: string;
  complexity: string;
  heroDescription?: string;
  fluxModel?: FluxModel;
}

export interface PlannerResult {
  success: boolean;
  pages?: CompiledPage[];
  error?: string;
  safetyIssue?: boolean;
  suggestions?: string[];
}

export interface CompiledPage {
  pageNumber: number;
  sceneBrief: string;
  compositionType: string;
  compiledPrompt: string;
  negativePrompt: string;
}

export async function planAndCompile(input: PlannerInput): Promise<PlannerResult> {
  // 1. Validate
  const validation = validateIdea(input.userIdea);
  if (!validation.valid) return { success: false, error: validation.reason };
  
  // 2. Sanitize
  const sanitizedIdea = sanitizePrompt(input.userIdea);
  
  // 3. Safety check
  const safetyResult = await checkContentSafety(sanitizedIdea, input.audience);
  if (!safetyResult.safe) {
    return {
      success: false,
      error: `Content not suitable for ${input.audience}`,
      safetyIssue: true,
      suggestions: safetyResult.suggestions,
    };
  }
  
  // 4. Build context
  const rules = AUDIENCE_DERIVATIONS[input.audience];
  const fluxConfig = FLUX_TRIGGERS[input.fluxModel || 'flux-lineart'];
  const negativePrompt = buildNegativePrompt(input.audience);
  
  const prompt = SYSTEM_PROMPT
    .replace(/{fluxTrigger}/g, fluxConfig.trigger || fluxConfig.template)
    .replace('{pageCount}', String(input.pageCount))
    .replace('{lineWeight}', input.lineWeight)
    .replace('{lineWeightDescription}', LINE_WEIGHT_PROMPTS[input.lineWeight as keyof typeof LINE_WEIGHT_PROMPTS])
    .replace('{complexity}', input.complexity)
    .replace('{complexityDescription}', COMPLEXITY_PROMPTS[input.complexity as keyof typeof COMPLEXITY_PROMPTS])
    .replace('{audience}', input.audience)
    .replace('{ageRange}', rules.ageRange)
    .replace('{safetyLevel}', rules.safetyLevel.toUpperCase())
    .replace('{forbiddenContent}', FORBIDDEN_BY_AUDIENCE[input.audience].slice(0, 15).join(', '))
    .replace('{maxElements}', String(rules.maxElements))
    .replace('{heroDescription}', input.heroDescription || 'No hero character')
    .replace('{negativePrompt}', negativePrompt);
  
  // 5. Call GPT-4o-mini
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Create ${input.pageCount} coloring pages for: "${sanitizedIdea}"` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });
    
    const content = response.choices[0].message.content;
    if (!content) return { success: false, error: 'No response' };
    
    const parsed = JSON.parse(content);
    return { success: true, pages: parsed.pages };
    
  } catch (error) {
    console.error('Planner error:', error);
    return { success: false, error: 'Failed to generate pages' };
  }
}

function buildNegativePrompt(audience: Audience): string {
  const base = [
    'shading', 'gradient', 'gray', 'color', 'photorealistic', '3D', 'shadow',
    'watermark', 'signature', 'text', 'broken lines', 'crosshatching', 'blurry'
  ];
  const audienceNegatives = FORBIDDEN_BY_AUDIENCE[audience].slice(0, 10);
  return [...new Set([...base, ...audienceNegatives])].join(', ');
}
