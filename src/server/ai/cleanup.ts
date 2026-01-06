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
  return image.png().toBuffer();
}

// Trim size to pixel dimensions at 300 DPI
export const TRIM_SIZES = {
  '8.5x11': { width: 2550, height: 3300 },  // 8.5 × 300, 11 × 300
  '8.5x8.5': { width: 2550, height: 2550 },
  '6x9': { width: 1800, height: 2700 },
} as const;

export type TrimSize = keyof typeof TRIM_SIZES;
