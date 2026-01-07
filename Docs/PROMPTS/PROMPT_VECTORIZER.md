# Prompt: Add SVG Vectorizer to Export

```
I'm building Myjoe (AI coloring book studio). Add SVG vectorization to export.

## Install

npm install sharp potrace svgo @types/sharp

## Create: src/server/export/vectorize.ts

import sharp from 'sharp';
import potrace from 'potrace';
import { optimize } from 'svgo';
import { logger } from '@/lib/logger';

const CONFIG = {
  threshold: 140,     // B&W cutoff (preserves line weight)
  turdSize: 2,        // Ignore specks < 2px
  optTolerance: 0.2,  // Curve accuracy
  batchSize: 5,       // Parallel processing limit
} as const;

export async function vectorizePage(pngBuffer: Buffer): Promise<string> {
  // 1. Remove anti-aliasing → pure B&W
  const pureBW = await sharp(pngBuffer)
    .grayscale()
    .threshold(CONFIG.threshold)
    .png()
    .toBuffer();

  // 2. Vectorize
  const rawSvg = await new Promise<string>((resolve, reject) => {
    potrace.trace(
      pureBW,
      { turdSize: CONFIG.turdSize, optTolerance: CONFIG.optTolerance },
      (err, svg) => (err ? reject(err) : resolve(svg))
    );
  });

  // 3. Optimize (reduces size ~50%)
  return optimize(rawSvg, { multipass: true, plugins: ['preset-default'] }).data;
}

export async function vectorizePages(
  pages: { pageNum: number; buffer: Buffer }[]
): Promise<{ pageNum: number; svg: string }[]> {
  const results: { pageNum: number; svg: string }[] = [];

  for (let i = 0; i < pages.length; i += CONFIG.batchSize) {
    const batch = pages.slice(i, i + CONFIG.batchSize);
    const processed = await Promise.allSettled(
      batch.map(async ({ pageNum, buffer }) => ({
        pageNum,
        svg: await vectorizePage(buffer),
      }))
    );

    for (const result of processed) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        logger.error('Vectorization failed', { error: result.reason });
      }
    }
  }

  return results.sort((a, b) => a.pageNum - b.pageNum);
}

## Create: src/lib/utils/slugify.ts

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

## Update: src/server/export/generate-export.ts

import { vectorizePages } from './vectorize';
import { slugify } from '@/lib/utils/slugify';
import JSZip from 'jszip';

export async function generateExportZip(
  project: { name: string },
  pages: { pageNum: number; buffer: Buffer }[],
  pdfBuffer: Buffer
): Promise<Buffer> {
  const zip = new JSZip();
  const prefix = slugify(project.name);
  const pad = (n: number) => String(n).padStart(2, '0');

  // PDF
  zip.file(`${prefix}-interior.pdf`, pdfBuffer);

  // PNGs
  for (const { pageNum, buffer } of pages) {
    zip.file(`png/${prefix}-page-${pad(pageNum)}.png`, buffer);
  }

  // SVGs (vectorized)
  const svgs = await vectorizePages(pages);
  for (const { pageNum, svg } of svgs) {
    zip.file(`svg/${prefix}-page-${pad(pageNum)}.svg`, svg);
  }

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

## Create: src/types/potrace.d.ts

declare module 'potrace' {
  interface PotraceOptions {
    turdSize?: number;
    optTolerance?: number;
  }
  function trace(
    image: Buffer,
    options: PotraceOptions,
    callback: (err: Error | null, svg: string) => void
  ): void;
  export { trace, PotraceOptions };
}

## Output Structure

my-dragon-book.zip
├── my-dragon-book-interior.pdf
├── png/
│   ├── my-dragon-book-page-01.png
│   ├── my-dragon-book-page-02.png
│   └── ...
└── svg/
    ├── my-dragon-book-page-01.svg
    ├── my-dragon-book-page-02.svg
    └── ...

## Key Points
- Project name prefixes all files (no conflicts between exports)
- Promise.allSettled = one failed page won't crash entire export
- Sorted output ensures correct page order
- DEFLATE compression for smaller zip
- FREE feature (no Blot cost)
```

```bash
git add . && git commit -m "feat: add SVG vectorization to export"
```
