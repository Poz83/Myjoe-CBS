import { getOpenAIClient } from './openai-client';

interface InpaintOptions {
  originalImage: Buffer;
  maskImage: Buffer;       // White = edit area, Black = preserve
  prompt: string;
  styleContext: string;    // From project DNA
}

export async function inpaintImage(options: InpaintOptions): Promise<Buffer> {
  const { originalImage, maskImage, prompt, styleContext } = options;
  
  const fullPrompt = `${prompt}. 
Coloring book style, black outlines on white, match the existing line weight and style exactly.
Style context: ${styleContext}
AVOID: shading, gradient, gray, different style, broken lines`;

  const response = await getOpenAIClient().images.edit({
    model: 'dall-e-2', // DALL-E 2 supports edit with mask
    image: originalImage as any, // Convert Buffer to File-like object
    mask: maskImage as any,
    prompt: fullPrompt,
    n: 1,
    size: '1024x1024',
    response_format: 'b64_json',
  });
  
  if (!response.data?.[0]?.b64_json) {
    throw new Error('OpenAI returned empty or invalid response');
  }
  
  return Buffer.from(response.data[0].b64_json, 'base64');
}
