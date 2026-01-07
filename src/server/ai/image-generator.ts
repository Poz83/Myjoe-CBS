import { getOpenAIClient } from './openai-client';

interface GenerateOptions {
  prompt: string;
  negativePrompt: string;
  heroReference?: Buffer; // Hero reference sheet image
  styleAnchor?: Buffer;   // Style anchor image
  size?: '1024x1024' | '1536x1024' | '1536x1536';
  quality?: 'low' | 'high';
}

/**
 * Retry helper function with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Check if error is retryable (network errors, rate limits, etc.)
      const isRetryable = 
        error instanceof Error &&
        (error.message.includes('ECONNRESET') ||
         error.message.includes('ETIMEDOUT') ||
         error.message.includes('rate_limit') ||
         error.message.includes('server_error') ||
         error.message.includes('503') ||
         error.message.includes('429'));
      
      if (!isRetryable) {
        // Don't retry on non-retryable errors (e.g., invalid prompt, auth issues)
        throw error;
      }
      
      // Exponential backoff: wait 1s, 2s, 4s...
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error(`Image generation failed after ${maxRetries + 1} attempts: ${lastError!.message}`);
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
  
  // Input validation
  if (!prompt?.trim()) {
    throw new Error('prompt is required and cannot be empty');
  }
  
  if (!negativePrompt?.trim()) {
    throw new Error('negativePrompt is required and cannot be empty');
  }
  
  // Build full prompt with negative
  const fullPrompt = `${prompt}

AVOID: ${negativePrompt}`;

  // Validate prompt length (OpenAI has limits)
  if (fullPrompt.length > 4000) {
    throw new Error('Combined prompt exceeds maximum length of 4000 characters');
  }

  return withRetry(async () => {
    try {
      // If we have reference images, use edit endpoint
      if (heroReference || styleAnchor) {
        const referenceImage = heroReference || styleAnchor;
        
        // Validate buffer
        if (!Buffer.isBuffer(referenceImage) || referenceImage.length === 0) {
          throw new Error('Invalid reference image buffer');
        }
        
        const response = await getOpenAIClient().images.edit({
          model: 'dall-e-2', // Note: dall-e-2 is used for edit capability (dall-e-3 doesn't support edits)
          image: referenceImage as any, // Convert Buffer to File-like object
          prompt: `Create a new coloring book page in the exact same style as this reference. ${fullPrompt}`,
          n: 1,
          size: '1024x1024', // DALL-E 2 only supports 1024x1024
          response_format: 'b64_json',
        });
        
        // Validate response
        if (!response.data?.[0]?.b64_json) {
          throw new Error('OpenAI returned empty or invalid response');
        }
        
        return Buffer.from(response.data[0].b64_json, 'base64');
      }
      
      // No reference, use generate endpoint
      // Map size to DALL-E 3 supported sizes
      let dalle3Size: '1024x1024' | '1024x1792' | '1792x1024';
      if (size === '1536x1024' || size === '1024x1024') {
        dalle3Size = '1792x1024'; // Closest to 1536x1024, will be resized by cleanup
      } else {
        dalle3Size = '1024x1024';
      }
      
      const response = await getOpenAIClient().images.generate({
        model: 'dall-e-3',
        prompt: fullPrompt,
        n: 1,
        size: dalle3Size,
        quality: quality === 'high' ? 'hd' : 'standard',
        response_format: 'b64_json',
      });
      
      // Validate response
      if (!response.data?.[0]?.b64_json) {
        throw new Error('OpenAI returned empty or invalid response');
      }
      
      return Buffer.from(response.data[0].b64_json, 'base64');
    } catch (error) {
      // Add context to error messages
      if (error instanceof Error) {
        if (error.message.includes('content_policy_violation')) {
          throw new Error('Image generation rejected: Content policy violation. Try adjusting the prompt.');
        }
        if (error.message.includes('billing')) {
          throw new Error('Image generation failed: Billing issue. Check your OpenAI account.');
        }
        // Re-throw with original message for other errors
        throw error;
      }
      throw new Error('Unknown error during image generation');
    }
  }, 2); // Max 2 retries as per spec
}
