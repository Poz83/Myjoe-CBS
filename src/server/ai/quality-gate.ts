import sharp from 'sharp';

interface QualityReport {
  passed: boolean;
  score: number;        // 0-100
  checks: QualityChecks;
  failReasons: string[];
}

interface QualityChecks {
  pureBlackWhite: boolean;  // No gray pixels
  hasContent: boolean;       // Not blank
  notTooDense: boolean;      // Not all black
  marginSafe: boolean;       // No ink at edges
}

export async function qualityCheck(imageBuffer: Buffer): Promise<QualityReport> {
  const image = sharp(imageBuffer);
  const stats = await image.stats();
  const metadata = await image.metadata();
  
  // Get raw pixel data for edge checking
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const checks: QualityChecks = {
    // Check 1: Pure B&W (no gray in histogram)
    pureBlackWhite: isPureBlackWhite(stats),
    
    // Check 2: Has content (not all white)
    hasContent: stats.channels[0].mean < 250,
    
    // Check 3: Not too dense (colorable)
    notTooDense: stats.channels[0].mean > 200,
    
    // Check 4: Margin safety (sample edge pixels)
    marginSafe: checkMargins(data, info.width, info.height, 75), // 75px = 0.25" at 300dpi
  };
  
  const failReasons = Object.entries(checks)
    .filter(([_, passed]) => !passed)
    .map(([check]) => check);
  
  const passedCount = Object.values(checks).filter(Boolean).length;
  const score = (passedCount / Object.keys(checks).length) * 100;
  
  return {
    passed: failReasons.length === 0,
    score,
    checks,
    failReasons,
  };
}

function isPureBlackWhite(stats: sharp.Stats): boolean {
  // Check if pixels are only at 0 or 255
  const channel = stats.channels[0];
  return channel.min <= 5 && channel.max >= 250;
}

function checkMargins(
  data: Buffer,
  width: number,
  height: number,
  margin: number
): boolean {
  // Sample pixels in top margin
  for (let y = 0; y < margin && y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x);
      if (data[idx] < 128) return false; // Found black pixel in margin
    }
  }
  
  // Sample pixels in bottom margin
  for (let y = Math.max(0, height - margin); y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x);
      if (data[idx] < 128) return false;
    }
  }
  
  // Sample pixels in left margin
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < margin && x < width; x++) {
      const idx = (y * width + x);
      if (data[idx] < 128) return false;
    }
  }
  
  // Sample pixels in right margin
  for (let y = 0; y < height; y++) {
    for (let x = Math.max(0, width - margin); x < width; x++) {
      const idx = (y * width + x);
      if (data[idx] < 128) return false;
    }
  }
  
  return true;
}
