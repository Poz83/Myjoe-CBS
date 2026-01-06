import { openai } from './openai-client';
import type { ProjectDNA, HeroDNA } from '@/types/domain';

const SYSTEM_PROMPT = `You are a coloring book page planner for professional KDP publishers.

Given a user's idea, create {pageCount} distinct scene briefs and compiled prompts.

RULES YOU MUST ENFORCE IN EVERY PROMPT:
- Coloring book page style
- Pure black outlines on pure white background
- No shading, no gradients, no gray tones, no textures, no fills
- No crosshatching or stippling
- {lineWeight} line weight (consistent across all pages)
- {complexity} level of detail
- Closed shapes suitable for coloring (no broken or open lines)
- No tiny intricate clusters that can't be colored
- No text, watermarks, or signatures
- Margin-safe composition (subject not touching edges, 10% padding)
- Single scene per page (no split panels)

LINE WEIGHT SPECIFICATIONS:
- thick: Bold 6-8px lines, chunky shapes, minimal detail
- medium: Clean 3-5px lines, balanced detail
- fine: Delicate 1-3px lines, intricate detail allowed

COMPLEXITY SPECIFICATIONS:
- minimal: 3-5 main elements, large simple shapes
- moderate: 5-10 elements, some decorative detail
- detailed: 10-20 elements, patterns and textures allowed
- intricate: 20+ elements, fine patterns, mandala-level detail

FOR HERO CHARACTER (if provided):
- Include this exact description in every scene where hero appears: {heroDescription}
- Hero must appear in at least 80% of pages
- Maintain consistent proportions and features
- Hero should be prominent in composition (20-40% of frame)

FOR STYLE CONSISTENCY:
- Match this style description: {styleAnchorDescription}
- Maintain consistent aesthetic across all pages

COMPOSITION VARIETY:
- Vary compositions across pages using these types:
  - close-up: Face or upper body focus (15% of pages)
  - full-body: Complete figure, centered (30% of pages)
  - action: Character doing something (25% of pages)
  - environment: Character small in larger scene (15% of pages)
  - pattern: Decorative/mandala style (15% of pages)
- No more than 2 consecutive pages with same composition type
- First page should be iconic/cover-worthy

OUTPUT FORMAT (JSON only, no explanation):
{
  "pages": [
    {
      "pageNumber": 1,
      "sceneBrief": "Short 5-10 word description for user display",
      "compositionType": "full-body",
      "compiledPrompt": "Full detailed prompt with all rules enforced...",
      "negativePrompt": "shading, gradient, gray, realistic, photograph, watermark, signature, text, broken lines, open shapes, crosshatching, texture, fill, 3D, shadow, color"
    }
  ]
}`;

interface PlannerInput {
  userIdea: string;
  projectDNA: ProjectDNA;
  hero?: HeroDNA;
}

export interface CompiledPage {
  pageNumber: number;
  sceneBrief: string;
  compositionType: string;
  compiledPrompt: string;
  negativePrompt: string;
}

export async function planAndCompile(input: PlannerInput): Promise<CompiledPage[]> {
  const { userIdea, projectDNA, hero } = input;
  
  const systemPrompt = SYSTEM_PROMPT
    .replace('{pageCount}', String(projectDNA.pageCount))
    .replace('{lineWeight}', projectDNA.lineWeight)
    .replace('{complexity}', projectDNA.complexity)
    .replace('{heroDescription}', hero?.compiledPrompt ?? 'No hero character')
    .replace('{styleAnchorDescription}', projectDNA.styleAnchorDescription ?? projectDNA.stylePreset);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userIdea }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const result = JSON.parse(response.choices[0].message.content!);
  return result.pages;
}
