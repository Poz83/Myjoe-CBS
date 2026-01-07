import { generateWithFlux, downloadImage, DEFAULT_NEGATIVE_PROMPT } from './flux-generator';
import { cleanupImage } from './cleanup';
import { FLUX_TRIGGERS, LINE_WEIGHT_PROMPTS, AUDIENCE_DERIVATIONS } from '@/lib/constants';
import type { Audience, StylePreset, FluxModel } from '@/types/domain';

interface CalibrationInput {
  subject: string;
  audience: Audience;
  stylePreset: StylePreset;
  fluxModel?: FluxModel;
}

interface CalibrationSample {
  id: string;
  imageBuffer: Buffer;
  variation: string;
}

const VARIATIONS = [
  'balanced interpretation',
  'more detailed with decorative accents',
  'simpler with bolder shapes',
  'more playful with curved lines',
];

/**
 * Generate 4 style calibration samples using Flux
 * User picks their favorite to establish style anchor
 */
export async function generateCalibrationSamples(
  input: CalibrationInput
): Promise<CalibrationSample[]> {
  const { subject, audience, stylePreset, fluxModel = 'flux-lineart' } = input;
  
  const rules = AUDIENCE_DERIVATIONS[audience];
  const fluxConfig = FLUX_TRIGGERS[fluxModel];
  const linePrompt = LINE_WEIGHT_PROMPTS[rules.lineWeight];
  
  const samples: CalibrationSample[] = [];
  
  // Generate 4 variations sequentially to avoid rate limits
  for (let i = 0; i < 4; i++) {
    const variation = VARIATIONS[i];
    
    const prompt = [
      fluxConfig.trigger || fluxConfig.template,
      subject,
      'coloring book page',
      linePrompt,
      `${stylePreset} style`,
      variation,
      'pure black outlines on white background',
      'no shading, no gradients',
    ].filter(Boolean).join(', ');
    
    const result = await generateWithFlux({
      compiledPrompt: prompt,
      negativePrompt: DEFAULT_NEGATIVE_PROMPT,
      fluxModel,
      trimSize: '8.5x11',
    });
    
    if (result.success && result.imageUrl) {
      const rawBuffer = await downloadImage(result.imageUrl);
      const cleanedBuffer = await cleanupImage(rawBuffer, {
        targetWidth: 512,
        targetHeight: 512,
      });
      
      samples.push({
        id: String(i + 1),
        imageBuffer: cleanedBuffer,
        variation,
      });
    }
  }
  
  return samples;
}

/**
 * Style rules for each preset
 */
export const STYLE_RULES: Record<StylePreset, string> = {
  'bold-simple': 'thick bold outlines, minimal detail, clean simple shapes',
  'kawaii': 'cute rounded shapes, big eyes, soft curves, charming style',
  'whimsical': 'flowing organic lines, magical elements, dreamy aesthetic',
  'cartoon': 'classic animation style, expressive lines, dynamic poses',
  'botanical': 'organic natural shapes, leaves and flowers, elegant patterns',
};

/**
 * Build a calibration prompt for a specific style
 */
export function buildCalibrationPrompt(
  subject: string,
  stylePreset: StylePreset,
  audience: Audience,
  variation: string
): string {
  const rules = AUDIENCE_DERIVATIONS[audience];
  const styleRule = STYLE_RULES[stylePreset];
  const linePrompt = LINE_WEIGHT_PROMPTS[rules.lineWeight];
  
  return [
    subject,
    'coloring book page',
    styleRule,
    linePrompt,
    variation,
    'pure black outlines on white background',
    'no shading, no gradients',
    'closed shapes suitable for coloring',
  ].join(', ');
}
