import { generateWithFlux, downloadImage } from './flux-generator';
import { cleanupImage } from './cleanup';
import { qualityCheck } from './quality-gate';
import { checkGeneratedImageSafety } from './image-safety-check';
import { TRIM_SIZES, GENERATION_DEFAULTS } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { ValidationError, NetworkError, AIGenerationError } from '@/types/errors';
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
 * Generates a single coloring book page with quality gates and safety checks.
 *
 * This function orchestrates the complete page generation pipeline:
 * 1. Generate image with Flux AI
 * 2. Download the generated image
 * 3. Clean up and resize to target dimensions
 * 4. Run quality assessment
 * 5. Safety check for children audiences
 * 6. Auto-retry on failures with exponential backoff
 *
 * @param options - Generation parameters
 * @param options.compiledPrompt - The AI-compiled prompt for image generation
 * @param options.negativePrompt - What the AI should avoid in the image
 * @param options.audience - Target audience (toddler, children, tween, teen, adult)
 * @param options.fluxModel - Which Flux model to use (flux-lineart, flux-dev-lora, flux-pro)
 * @param options.trimSize - Page size (8.5x11, 8.5x8.5, 6x9)
 * @param options.maxRetries - Maximum retry attempts (default: 2, max: 10)
 * @returns Promise resolving to generation result with image buffer and metadata
 *
 * @example
 * ```typescript
 * const result = await generatePage({
 *   compiledPrompt: "A happy cat playing in a sunny garden, coloring book style",
 *   negativePrompt: "shading, gradient, gray, color, photorealistic",
 *   audience: "children",
 *   fluxModel: "flux-pro",
 *   trimSize: "8.5x11",
 *   maxRetries: 3
 * });
 *
 * if (result.success) {
 *   // Save result.imageBuffer to file or database
 *   console.log(`Generated in ${result.generationTime}ms`);
 * } else {
 *   console.error('Generation failed:', result.error);
 * }
 * ```
 */
export async function generatePage(options: GeneratePageOptions): Promise<PageResult> {
  const { compiledPrompt, negativePrompt, audience, fluxModel, trimSize, maxRetries = GENERATION_DEFAULTS.MAX_RETRIES } = options;

  // Input validation
  if (!compiledPrompt?.trim()) {
    const error = new ValidationError('Compiled prompt is required and cannot be empty');
    logger.error('Input validation failed', { error: error.message, field: 'compiledPrompt' });
    return { success: false, error: error.message };
  }
  if (!negativePrompt?.trim()) {
    const error = new ValidationError('Negative prompt is required and cannot be empty');
    logger.error('Input validation failed', { error: error.message, field: 'negativePrompt' });
    return { success: false, error: error.message };
  }
  if (maxRetries < 0 || maxRetries > GENERATION_DEFAULTS.MAX_RETRIES_LIMIT) {
    const error = new ValidationError(`maxRetries must be between 0 and ${GENERATION_DEFAULTS.MAX_RETRIES_LIMIT}`);
    logger.error('Input validation failed', { error: error.message, field: 'maxRetries', value: maxRetries });
    return { success: false, error: error.message };
  }

  const dimensions = TRIM_SIZES[trimSize] || TRIM_SIZES['8.5x11'];
  const startTime = Date.now();
  
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
        // Exponential backoff delay
        const delay = GENERATION_DEFAULTS.RETRY_DELAYS[attempt] || GENERATION_DEFAULTS.RETRY_DELAYS[GENERATION_DEFAULTS.RETRY_DELAYS.length - 1];
        await new Promise(resolve => setTimeout(resolve, delay));
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
      if (GENERATION_DEFAULTS.CHILD_AUDIENCES.includes(audience as typeof GENERATION_DEFAULTS.CHILD_AUDIENCES[number])) {
        const safetyResult = await checkGeneratedImageSafety(genResult.imageUrl!, audience);
        safetyPassed = safetyResult.safe;
        
        if (!safetyPassed && safetyResult.recommendation === 'regenerate' && attempt < maxRetries) {
          continue; // Auto-retry
        }
      }
      
      // 6. Return result
      const duration = Date.now() - startTime;
      logger.info('Page generation completed successfully', {
        duration,
        attempt: attempt + 1,
        fluxModel,
        audience,
        qualityScore: quality.score,
        safetyPassed,
        needsReview: !quality.passed || !safetyPassed
      });

      return {
        success: true,
        imageBuffer: cleanedBuffer,
        seed: genResult.seed,
        qualityScore: quality.score,
        safetyPassed,
        needsReview: !quality.passed || !safetyPassed,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during generation';

      // Categorize the error
      let errorCode = 'UNKNOWN';
      if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('fetch')) {
        errorCode = 'NETWORK';
      } else if (errorMessage.includes('generation') || errorMessage.includes('flux') || errorMessage.includes('replicate')) {
        errorCode = 'AI_GENERATION';
      }

      logger.error(`Generation attempt ${attempt + 1} failed`, {
        duration,
        attempt: attempt + 1,
        fluxModel,
        audience,
        error: errorMessage,
        errorCode,
        willRetry: attempt < maxRetries
      });

      if (attempt === maxRetries) {
        return {
          success: false,
          error: errorMessage,
        };
      }
    }
  }
  
  return { success: false, error: 'Max retries exceeded' };
}
