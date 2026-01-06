import { openai } from './openai-client';
import type { StylePreset, Audience } from '@/types/domain';

const STYLE_VARIATIONS = [
  'default interpretation',
  'slightly more detailed with decorative elements',
  'simpler with bolder shapes',
  'more whimsical with curved lines',
];

export async function generateCalibrationSamples(
  subject: string,
  stylePreset: StylePreset,
  audience: Audience
): Promise<Buffer[]> {
  const basePrompt = buildBasePrompt(subject, stylePreset, audience);
  
  const samples = await Promise.all(
    STYLE_VARIATIONS.map(async (variation, i) => {
      const prompt = `${basePrompt}, ${variation}`;
      
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard', // Faster for samples
        response_format: 'b64_json',
      });
      
      return Buffer.from(response.data[0].b64_json!, 'base64');
    })
  );
  
  return samples;
}

function buildBasePrompt(
  subject: string,
  stylePreset: StylePreset,
  audience: Audience
): string {
  const styleRules = STYLE_RULES[stylePreset];
  const audienceRules = AUDIENCE_RULES[audience];
  
  return `${subject}, coloring book page style, ${styleRules}, ${audienceRules}, pure black outlines on white background, no shading, no gradients, closed shapes suitable for coloring`;
}

const STYLE_RULES: Record<StylePreset, string> = {
  'bold-simple': 'thick bold outlines, minimal detail, clean simple shapes',
  'kawaii': 'cute rounded shapes, big eyes, soft curves, charming style',
  'whimsical': 'flowing organic lines, magical elements, dreamy aesthetic',
  'cartoon': 'classic animation style, expressive lines, dynamic poses',
  'botanical': 'organic natural shapes, leaves and flowers, elegant patterns',
};

const AUDIENCE_RULES: Record<Audience, string> = {
  'toddler': 'very thick lines 8px+, 3-5 large simple shapes only',
  'children': 'thick lines 6px, moderate detail, friendly compositions',
  'tween': 'medium lines 4px, balanced complexity, engaging scenes',
  'teen': 'medium-fine lines 3px, detailed but not overwhelming',
  'adult': 'fine lines 2px, intricate detail allowed, sophisticated patterns',
};
