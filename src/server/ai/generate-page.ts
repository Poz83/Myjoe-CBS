import { generateWithFlux, downloadImage } from './flux-generator';
import { cleanupImage } from './cleanup';
import { qualityCheck } from './quality-gate';
import { checkGeneratedImageSafety } from './image-safety-check';
import { TRIM_SIZES } from '@/lib/constants';
import type { Audience, FluxModel, TrimSize } from '@/types/domain';

interface GeneratePageOptions {
  compiledPrompt: string;
  negativePrompt: string;
  audience: Audience;
  fluxModel: FluxModel;
  trimSize: TrimSize;
  maxRetries?: number;
}

interface PageResult {
  success: boolean;
  imageBuffer?: Buffer;
  seed?: number;
  qualityScore?: number;
  safetyPassed?: boolean;
  needsReview?: boolean;
  error?: string;
}

/**
 * Complete page generation pipeline with quality gates and safety checks
 * Orchestrates: Flux generation → download → cleanup → quality check → safety check
 * Auto-retries on failures up to maxRetries
 */
export async function generatePage(options: GeneratePageOptions): Promise<PageResult> {
  const { compiledPrompt, negativePrompt, audience, fluxModel, trimSize, maxRetries = 2 } = options;
  const dimensions = TRIM_SIZES[trimSize] || TRIM_SIZES['8.5x11'];
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 1. Generate with Flux
      const genResult = await generateWithFlux({
        compiledPrompt,
        negativePrompt,
        fluxModel,
        trimSize,
      });
      
      if (!genResult.success) {
        if (attempt === maxRetries) {
          return { success: false, error: genResult.error || 'Generation failed' };
        }
        continue;
      }
      
      // 2. Download image
      const rawBuffer = await downloadImage(genResult.imageUrl!);
      
      // 3. Cleanup
      const cleanedBuffer = await cleanupImage(rawBuffer, {
        targetWidth: dimensions.width,
        targetHeight: dimensions.height,
      });
      
      // 4. Quality gate
      const quality = await qualityCheck(cleanedBuffer);
      
      // 5. Safety check for children
      let safetyPassed = true;
      if (['toddler', 'children'].includes(audience)) {
        const safetyResult = await checkGeneratedImageSafety(genResult.imageUrl!, audience);
        safetyPassed = safetyResult.safe;
        
        if (!safetyPassed && safetyResult.recommendation === 'regenerate' && attempt < maxRetries) {
          continue; // Auto-retry
        }
      }
      
      // 6. Return result
      return {
        success: true,
        imageBuffer: cleanedBuffer,
        seed: genResult.seed,
        qualityScore: quality.score,
        safetyPassed,
        needsReview: !quality.passed || !safetyPassed,
      };
    } catch (error) {
      console.error(`Generation attempt ${attempt + 1} failed:`, error);
      if (attempt === maxRetries) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error during generation',
        };
      }
    }
  }
  
  return { success: false, error: 'Max retries exceeded' };
}
