import sharp from 'sharp';

interface CleanupOptions {
  targetWidth: number;  // Based on trim size
  targetHeight: number;
  threshold?: number;   // B&W threshold (default 128)
}

export async function cleanupImage(
  imageBuffer: Buffer,
  options: CleanupOptions
): Promise<Buffer> {
  const { targetWidth, targetHeight, threshold = 128 } = options;
  
  // Input validation
  if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
    throw new Error('Invalid image buffer: must be a non-empty Buffer');
  }
  
  if (targetWidth <= 0 || targetHeight <= 0) {
    throw new Error('Invalid dimensions: targetWidth and targetHeight must be positive numbers');
  }
  
  if (threshold < 0 || threshold > 255) {
    throw new Error('Invalid threshold: must be between 0 and 255');
  }
  
  try {
    let image = sharp(imageBuffer);
    
    // Step 1: Convert to grayscale
    image = image.grayscale();
    
    // Step 2: Threshold to pure B&W
    // Pixels > threshold = white (255), else = black (0)
    image = image.threshold(threshold);
    
    // Step 3: Morphological cleanup (remove specs)
    // Sharp doesn't have built-in morphology, so we use blur + threshold trick
    image = image
      .blur(0.5)      // Slight blur to smooth jaggies
      .threshold(200); // Re-threshold to clean up
    
    // Step 4: Resize to target dimensions (300 DPI)
    image = image.resize(targetWidth, targetHeight, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255 },
    });
    
    // Step 5: Ensure pure white background
    image = image.flatten({ background: { r: 255, g: 255, b: 255 } });
    
    // Output as PNG
    return await image.png().toBuffer();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Image cleanup failed: ${error.message}`);
    }
    throw new Error('Unknown error during image cleanup');
  }
}

/**
 * Create a JPEG thumbnail from an image buffer
 * @param imageBuffer - Source image buffer
 * @param size - Thumbnail size (width and height in pixels, default 300)
 * @returns JPEG thumbnail buffer
 */
export async function createThumbnail(
  imageBuffer: Buffer,
  size: number = 300
): Promise<Buffer> {
  // Input validation
  if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
    throw new Error('Invalid image buffer: must be a non-empty Buffer');
  }
  
  if (size <= 0 || size > 2000) {
    throw new Error('Invalid thumbnail size: must be between 1 and 2000 pixels');
  }
  
  try {
    return await sharp(imageBuffer)
      .resize(size, size, {
        fit: 'inside', // Maintain aspect ratio, fit within size x size
        background: { r: 255, g: 255, b: 255 },
      })
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toBuffer();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Thumbnail creation failed: ${error.message}`);
    }
    throw new Error('Unknown error during thumbnail creation');
  }
}

// Trim size to pixel dimensions at 300 DPI
export const TRIM_SIZES = {
  '8.5x11': { width: 2550, height: 3300 },  // 8.5 × 300, 11 × 300
  '8.5x8.5': { width: 2550, height: 2550 },
  '6x9': { width: 1800, height: 2700 },
} as const;

export type TrimSize = keyof typeof TRIM_SIZES;
