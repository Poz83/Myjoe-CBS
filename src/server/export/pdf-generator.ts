import PDFDocument from 'pdfkit';
import JSZip from 'jszip';
import { TRIM_SIZES } from '@/lib/constants';
import { vectorizeBatch } from './vectorize';
import { slugify } from '@/lib/utils/slugify';

interface ExportInput {
  projectId: string;
  projectName: string;
  trimSize: string;
  pages: Array<{
    sortOrder: number;
    imageBuffer: Buffer;
  }>;
}

/**
 * Generate a print-ready PDF from page images
 * Pages are added at full bleed with exact trim size dimensions
 */
export async function generateInteriorPDF(input: ExportInput): Promise<Buffer> {
  const { trimSize, pages } = input;
  const dimensions = TRIM_SIZES[trimSize as keyof typeof TRIM_SIZES];

  // Convert pixels to points (72 points = 1 inch, 300 DPI)
  const widthPt = (dimensions.width / 300) * 72;
  const heightPt = (dimensions.height / 300) * 72;

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    const doc = new PDFDocument({
      size: [widthPt, heightPt],
      margin: 0,
    });

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Sort pages by sort order
    const sortedPages = [...pages].sort((a, b) => a.sortOrder - b.sortOrder);

    // Add each page
    sortedPages.forEach((page, index) => {
      if (index > 0) doc.addPage();
      doc.image(page.imageBuffer, 0, 0, {
        width: widthPt,
        height: heightPt,
      });
    });

    doc.end();
  });
}

/**
 * Generate a comprehensive ZIP archive containing:
 * - PDF interior document
 * - PNG folder with all page images
 * - SVG folder with vectorized versions
 *
 * Structure:
 *   my-book-name.zip
 *   ├── my-book-name-interior.pdf
 *   ├── png/
 *   │   └── my-book-name-page-01.png
 *   └── svg/
 *       └── my-book-name-page-01.svg
 */
export async function generateExportZip(input: ExportInput): Promise<Buffer> {
  const { pages, projectName } = input;

  const zip = new JSZip();
  const slug = slugify(projectName);

  // Sort pages by sort order
  const sortedPages = [...pages].sort((a, b) => a.sortOrder - b.sortOrder);

  // 1. Generate interior PDF and add to ZIP
  const pdfBuffer = await generateInteriorPDF(input);
  zip.file(`${slug}-interior.pdf`, pdfBuffer);

  // 2. Create PNG folder and add all images
  const pngFolder = zip.folder('png');
  if (pngFolder) {
    sortedPages.forEach((page) => {
      const pageNum = String(page.sortOrder + 1).padStart(2, '0');
      const fileName = `${slug}-page-${pageNum}.png`;
      pngFolder.file(fileName, page.imageBuffer);
    });
  }

  // 3. Vectorize all PNGs and add to SVG folder
  const pngBuffers = sortedPages.map((p) => p.imageBuffer);
  const svgResults = await vectorizeBatch(pngBuffers, {
    threshold: 140,
    turdSize: 2,
    optTolerance: 0.2,
  }, 5);

  const svgFolder = zip.folder('svg');
  if (svgFolder) {
    svgResults.forEach((result, index) => {
      const pageNum = String(sortedPages[index].sortOrder + 1).padStart(2, '0');
      const fileName = `${slug}-page-${pageNum}.svg`;
      svgFolder.file(fileName, result.svg);
    });
  }

  // Generate final ZIP buffer
  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  return zipBuffer;
}
