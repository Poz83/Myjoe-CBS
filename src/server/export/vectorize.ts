import sharp from 'sharp';
import potrace from 'potrace';
import { optimize } from 'svgo';

// ============================================================================
// Types
// ============================================================================

interface VectorizeOptions {
  threshold?: number;    // Grayscale threshold (0-255)
  turdSize?: number;     // Suppress speckles up to this size
  optTolerance?: number; // Curve optimization tolerance
}

interface VectorizeResult {
  svg: string;
  width: number;
  height: number;
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_OPTIONS: Required<VectorizeOptions> = {
  threshold: 140,
  turdSize: 2,
  optTolerance: 0.2,
};

// ============================================================================
// vectorizePng - Convert PNG buffer to optimized SVG
// ============================================================================

export async function vectorizePng(
  pngBuffer: Buffer,
  options: VectorizeOptions = {}
): Promise<VectorizeResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Step 1: Preprocess with sharp - convert to grayscale and threshold
  const { data, info } = await sharp(pngBuffer)
    .grayscale()
    .threshold(opts.threshold)
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Convert raw buffer back to PNG for potrace
  const processedPng = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 1 },
  })
    .png()
    .toBuffer();

  // Step 2: Vectorize with potrace
  const rawSvg = await new Promise<string>((resolve, reject) => {
    potrace.trace(processedPng, {
      turdSize: opts.turdSize,
      optTolerance: opts.optTolerance,
      color: '#000000',
      background: '#ffffff',
    }, (err: Error | null, svg: string) => {
      if (err) reject(err);
      else resolve(svg);
    });
  });

  // Step 3: Optimize with SVGO
  const optimized = optimize(rawSvg, {
    multipass: true,
    plugins: [
      'preset-default',
      'removeXMLNS',
      {
        name: 'removeAttrs',
        params: { attrs: ['data-*'] },
      },
    ],
  });

  return {
    svg: optimized.data,
    width: info.width,
    height: info.height,
  };
}

// ============================================================================
// vectorizeBatch - Process multiple PNGs concurrently
// ============================================================================

export async function vectorizeBatch(
  pngBuffers: Buffer[],
  options: VectorizeOptions = {},
  concurrency: number = 5
): Promise<VectorizeResult[]> {
  const results: VectorizeResult[] = [];

  // Process in batches to limit concurrency
  for (let i = 0; i < pngBuffers.length; i += concurrency) {
    const batch = pngBuffers.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((buffer) => vectorizePng(buffer, options))
    );
    results.push(...batchResults);
  }

  return results;
}
