import { getOpenAIClient } from './openai-client';
import { AUDIENCE_DERIVATIONS } from '@/lib/constants';
import type { Audience } from '@/lib/constants';

/**
 * Base line thickness mapping from audience
 */
const AUDIENCE_BASE_THICKNESS: Record<Audience, number> = {
  toddler: 6, // Thick
  children: 6, // Thick
  tween: 4,   // Medium
  teen: 4,    // Medium
  adult: 2,   // Fine
};

/**
 * Detect optimal line thickness based on audience and idea content
 * Returns thickness in points (2-8)
 */
export async function detectLineThickness(
  audience: Audience,
  idea: string
): Promise<number> {
  // Base thickness from audience
  const audienceBase = AUDIENCE_BASE_THICKNESS[audience];

  // Analyze idea content with GPT-4o-mini
  const ideaAnalysis = await analyzeIdeaComplexity(idea);

  // Combine: (audience_base + idea_analysis) / 2
  const combined = (audienceBase + ideaAnalysis) / 2;

  // Round to nearest valid thickness (2pt, 4pt, 6pt, 8pt)
  const rounded = Math.round(combined / 2) * 2;
  
  // Clamp to valid range
  return Math.max(2, Math.min(8, rounded));
}

/**
 * Analyze idea content to determine complexity/thickness preference
 * Returns a thickness value (2-8) based on content analysis
 */
async function analyzeIdeaComplexity(idea: string): Promise<number> {
  const prompt = `Analyze this coloring book idea and determine the optimal line thickness (in points, 2-8).

Idea: "${idea}"

Consider:
- Simple words/concepts → thicker lines (6-8pt)
- Complex descriptions → finer lines (2-4pt)
- Keywords like "intricate", "detailed", "mandala" → fine (2pt)
- Keywords like "simple", "bold", "chunky" → thick (6-8pt)
- Keywords like "balanced", "moderate" → medium (4pt)

Respond with ONLY a number between 2 and 8 (no explanation).`;

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a coloring book design expert. Respond with only a number.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    const content = response.choices[0].message.content?.trim();
    if (!content) return 4; // Default to medium

    const parsed = parseInt(content);
    if (isNaN(parsed)) return 4;

    // Clamp to valid range
    return Math.max(2, Math.min(8, parsed));
  } catch (error) {
    console.error('Line thickness detection error:', error);
    return 4; // Default to medium on error
  }
}
