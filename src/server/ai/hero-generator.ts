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
