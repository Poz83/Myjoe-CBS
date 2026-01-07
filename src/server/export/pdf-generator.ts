import PDFDocument from 'pdfkit';
import archiver from 'archiver';
import { TRIM_SIZES } from '@/lib/constants';

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
 * Generate a ZIP archive containing all page images as PNGs
 */
export async function generateExportZip(input: ExportInput): Promise<Buffer> {
  const { pages, projectName } = input;

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    // Sort pages by sort order
    const sortedPages = [...pages].sort((a, b) => a.sortOrder - b.sortOrder);

    // Add each page as PNG
    sortedPages.forEach((page) => {
      // Sanitize project name for file system
      const safeName = projectName.replace(/[^a-zA-Z0-9-_]/g, '_');
      const fileName = `${safeName}_page_${String(page.sortOrder + 1).padStart(2, '0')}.png`;
      archive.append(page.imageBuffer, { name: fileName });
    });

    archive.finalize();
  });
}
