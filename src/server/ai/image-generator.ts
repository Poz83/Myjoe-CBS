import { openai } from './openai-client';

interface GenerateOptions {
  prompt: string;
  negativePrompt: string;
  heroReference?: Buffer; // Hero reference sheet image
  styleAnchor?: Buffer;   // Style anchor image
  size?: '1024x1024' | '1536x1024' | '1536x1536';
  quality?: 'low' | 'high';
}

export async function generateImage(options: GenerateOptions): Promise<Buffer> {
  const { 
    prompt, 
    negativePrompt, 
    heroReference, 
    styleAnchor,
    size = '1536x1024',
    quality = 'high'
  } = options;
  
  // Build full prompt with negative
  const fullPrompt = `${prompt}

AVOID: ${negativePrompt}`;

  // If we have reference images, use edit endpoint
  if (heroReference || styleAnchor) {
    const referenceImage = heroReference || styleAnchor;
    
    const response = await openai.images.edit({
      model: 'dall-e-2', // Note: GPT Image 1.5 is conceptual; using DALL-E 2 for edit capability
      image: referenceImage,
      prompt: `Create a new coloring book page in the exact same style as this reference. ${fullPrompt}`,
      n: 1,
      size: size === '1536x1536' ? '1024x1024' : '1024x1024', // DALL-E 2 only supports 1024x1024
      response_format: 'b64_json',
    });
    
    return Buffer.from(response.data[0].b64_json!, 'base64');
  }
  
  // No reference, use generate endpoint
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: fullPrompt,
    n: 1,
    size: size === '1536x1536' ? '1024x1024' : '1024x1024',
    quality: quality === 'high' ? 'hd' : 'standard',
    response_format: 'b64_json',
  });
  
  return Buffer.from(response.data[0].b64_json!, 'base64');
}
