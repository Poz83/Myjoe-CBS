import { openai } from './openai-client';
import type { Audience } from '@/types/domain';

interface HeroInput {
  name: string;
  description: string;
  audience: Audience;
}

export async function compileHeroPrompt(input: HeroInput): Promise<string> {
  const { name, description, audience } = input;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a character designer for coloring books.
        
Create a detailed prompt for a CHARACTER REFERENCE SHEET containing:
- Front view (facing viewer directly)
- Side view (profile, facing right)  
- Back view (facing away)
- 3/4 view (slightly turned)

All 4 views must be:
- Same character with IDENTICAL proportions
- Arranged in a 2x2 grid on white background
- Coloring book style: pure black outlines on white
- Line weight appropriate for ${audience} audience
- No shading, no gradients, no gray
- Simple, clear, consistent
- Labeled: "FRONT" "SIDE" "BACK" "3/4"

Output ONLY the prompt text, no explanation.`
      },
      {
        role: 'user',
        content: `Character name: ${name}\nDescription: ${description}\nAudience: ${audience}`
      }
    ],
    temperature: 0.5,
  });
  
  return response.choices[0].message.content!;
}

export async function generateHeroSheet(compiledPrompt: string): Promise<Buffer> {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: compiledPrompt,
    n: 1,
    size: '1024x1024', // Square for 2×2 grid
    quality: 'hd',
    response_format: 'b64_json',
  });
  
  return Buffer.from(response.data[0].b64_json!, 'base64');
}
