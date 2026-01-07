import Replicate from 'replicate';
import { FLUX_MODELS, TRIM_SIZES } from '@/lib/constants';
import type { FluxModel } from '@/lib/constants';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

interface GenerateOptions {
  compiledPrompt: string;
  negativePrompt: string;
  fluxModel: FluxModel;
  trimSize: string;
  seed?: number;
}

interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  seed?: number;
  error?: string;
}

export async function generateWithFlux(options: GenerateOptions): Promise<GenerationResult> {
  const { compiledPrompt, negativePrompt, fluxModel, trimSize, seed } = options;
  
  const model = FLUX_MODELS[fluxModel];
  const dimensions = TRIM_SIZES[trimSize as keyof typeof TRIM_SIZES] || TRIM_SIZES['8.5x11'];
  
  const params: Record<string, any> = {
    prompt: compiledPrompt,
    negative_prompt: negativePrompt,
    num_inference_steps: 28,
    guidance_scale: 3.5,
    output_format: 'png',
    output_quality: 95,
    seed: seed ?? Math.floor(Math.random() * 2147483647),
    aspect_ratio: dimensions.aspectRatio,
  };
  
  try {
    const output = await replicate.run(model as `${string}/${string}`, { input: params });
    const imageUrl = Array.isArray(output) ? output[0] : output;
    
    return {
      success: true,
      imageUrl: imageUrl as string,
      seed: params.seed,
    };
  } catch (error) {
    console.error('Flux generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Generation failed',
    };
  }
}

export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to download image');
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Default negative prompt for coloring book pages
 * Kept for backward compatibility with style-calibration.ts
 */
export const DEFAULT_NEGATIVE_PROMPT = 
  'shading, gradient, gray, color, photorealistic, 3D, blurry, noise, artifacts, watermark, signature, text';
