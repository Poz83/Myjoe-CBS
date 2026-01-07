import { getOpenAIClient } from './openai-client';
import { AUDIENCE_DERIVATIONS } from '@/lib/constants';
import type { Audience } from '@/types/domain';

interface ImageSafetyResult {
  safe: boolean;
  issues: string[];
  recommendation: 'approve' | 'regenerate' | 'flag';
}

/**
 * Check generated image safety using GPT-4o vision
 * Only runs for strict audiences (toddler, children) to save costs
 */
export async function checkGeneratedImageSafety(
  imageUrl: string,
  audience: Audience
): Promise<ImageSafetyResult> {
  // Only run for strict audiences (toddler, children)
  if (!['toddler', 'children'].includes(audience)) {
    return { safe: true, issues: [], recommendation: 'approve' };
  }
  
  const rules = AUDIENCE_DERIVATIONS[audience];
  
  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You review coloring book images for children (ages ${rules.ageRange}).

Flag ANY of these:
- Scary or frightening elements
- Weapons or violence
- Monsters that could frighten children
- Dark or disturbing themes
- Inappropriate content

Respond ONLY with JSON:
{"safe": boolean, "issues": ["list"], "recommendation": "approve"|"regenerate"|"flag"}`
        },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            { type: 'text', text: `Is this safe for ${audience} (ages ${rules.ageRange})?` }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });
    
    const content = response.choices[0].message.content;
    if (content) {
      return JSON.parse(content) as ImageSafetyResult;
    }
    
    return { safe: true, issues: [], recommendation: 'approve' };
    
  } catch (error) {
    console.error('Image safety check failed:', error);
    // On error, flag for manual review rather than auto-approve
    return { 
      safe: false, 
      issues: ['Unable to verify image safety'], 
      recommendation: 'flag' 
    };
  }
}

/**
 * Check multiple images in parallel
 */
export async function checkImagesInBatch(
  imageUrls: string[],
  audience: Audience
): Promise<ImageSafetyResult[]> {
  return Promise.all(
    imageUrls.map(url => checkGeneratedImageSafety(url, audience))
  );
}
