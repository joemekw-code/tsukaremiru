/**
 * Fatigue Analysis Engine - Browser-side
 * Uses MediaPipe Face Landmarker for facial analysis
 *
 * Signals:
 *   - EAR (Eye Aspect Ratio) + PERCLOS
 *   - Blink duration analysis
 *   - Periorbital color (dark circles via LAB color space)
 *   - Two-Process Model (Borbély 1982)
 *
 * References:
 *   - Dinges et al. (1998) PERCLOS
 *   - Caffier et al. (2003) blink duration
 *   - Ingre et al. (2006) PERCLOS-KSS correlation
 */

// Landmark indices
const LEFT_EYE = [362, 385, 387, 263, 373, 380];
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];
const LEFT_EYE_BOTTOM = [374, 380, 381, 382, 362, 263];
const RIGHT_EYE_BOTTOM = [145, 153, 154, 155, 133, 33];
const LEFT_CHEEK = 425;
const RIGHT_CHEEK = 205;
const NOSE_TIP = 1;

export interface FatigueResult {
  fatigueScore: number;       // 0-100
  kss: number;                // 1-9 Karolinska Sleepiness Scale
  estimatedSleepHours: number;
  shouldSleepScore: number;   // 0-100
  signals: {
    earAvg: number;
    perclos: number;
    blinkCount: number;
    meanBlinkDurationMs: number;
    slowBlinkRatio: number;
    darkCircleDeltaE: number;
    brightnessDiff: number;
    headNodRatio: number;
  };
  components: Record<string, number>;
  recommendation: string;
  timestamp: number;
}

interface Landmark {
  x: number;
  y: number;
  z: number;
}

function sigmoid(x: number, center: number, steepness: number): number {
  const z = Math.max(-500, Math.min(500, steepness * (x - center)));
  return 1 / (1 + Math.exp(-z));
}

function computeEAR(landmarks: Landmark[], indices: number[]): number {
  const pts = indices.map(i => landmarks[i]);
  const v1 = Math.hypot(pts[1].x - pts[5].x, pts[1].y - pts[5].y);
  const v2 = Math.hypot(pts[2].x - pts[4].x, pts[2].y - pts[4].y);
  const h = Math.hypot(pts[0].x - pts[3].x, pts[0].y - pts[3].y);
  return h > 0 ? (v1 + v2) / (2 * h) : 0.3;
}

function computePERCLOS(earSeries: number[]): number {
  if (earSeries.length < 10) return 0;
  const sorted = [...earSeries].sort((a, b) => a - b);
  const p80 = sorted[Math.floor(sorted.length * 0.8)];
  const threshold = p80 * 0.5;
  const closed = earSeries.filter(e => e < threshold).length;
  return closed / earSeries.length;
}

function computeBlinkMetrics(earSeries: number[], fps: number) {
  if (earSeries.length < 30) {
    return { count: 0, meanDurationMs: 0, slowBlinkRatio: 0, sdbiMs: 0 };
  }
  const sorted = [...earSeries].sort((a, b) => a - b);
  const p80 = sorted[Math.floor(sorted.length * 0.8)];
  const threshold = p80 * 0.6;

  const blinks: number[] = [];
  const intervals: number[] = [];
  let inBlink = false;
  let blinkStart = 0;
  let lastBlinkEnd = 0;

  for (let i = 0; i < earSeries.length; i++) {
    if (earSeries[i] < threshold && !inBlink) {
      inBlink = true;
      blinkStart = i;
    } else if (earSeries[i] >= threshold && inBlink) {
      inBlink = false;
      const durMs = ((i - blinkStart) / fps) * 1000;
      if (durMs >= 30 && durMs <= 800) {
        blinks.push(durMs);
        if (lastBlinkEnd > 0) {
          intervals.push(((blinkStart - lastBlinkEnd) / fps) * 1000);
        }
        lastBlinkEnd = i;
      }
    }
  }

  const slowBlinks = blinks.filter(b => b > 200);

  return {
    count: blinks.length,
    meanDurationMs: blinks.length > 0 ? blinks.reduce((a, b) => a + b, 0) / blinks.length : 0,
    slowBlinkRatio: blinks.length > 0 ? slowBlinks.length / blinks.length : 0,
    sdbiMs: intervals.length > 1
      ? Math.sqrt(intervals.map(v => Math.pow(v - intervals.reduce((a, b) => a + b, 0) / intervals.length, 2)).reduce((a, b) => a + b, 0) / (intervals.length - 1))
      : 0,
  };
}

function getRegionAvgColor(
  imageData: ImageData,
  cx: number,
  cy: number,
  size: number,
  width: number,
  height: number
): [number, number, number] {
  // Sample a square region and return average RGB
  let r = 0, g = 0, b = 0, count = 0;
  const x1 = Math.max(0, Math.floor(cx - size));
  const y1 = Math.max(0, Math.floor(cy - size));
  const x2 = Math.min(width - 1, Math.floor(cx + size));
  const y2 = Math.min(height - 1, Math.floor(cy + size));

  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      const idx = (y * width + x) * 4;
      r += imageData.data[idx];
      g += imageData.data[idx + 1];
      b += imageData.data[idx + 2];
      count++;
    }
  }

  return count > 0 ? [r / count, g / count, b / count] : [128, 128, 128];
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  // sRGB → XYZ → CIELAB
  let rr = r / 255, gg = g / 255, bb = b / 255;
  rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92;
  gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92;
  bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92;

  let x = (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) / 0.95047;
  let y = (rr * 0.2126 + gg * 0.7152 + bb * 0.0722) / 1.0;
  let z = (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

function computeColorMetrics(
  imageData: ImageData,
  landmarks: Landmark[],
  width: number,
  height: number
) {
  // Under-eye: midpoint of lower eye contour, shifted down
  const leftEyeBottom = LEFT_EYE_BOTTOM.map(i => landmarks[i]);
  const rightEyeBottom = RIGHT_EYE_BOTTOM.map(i => landmarks[i]);

  const leftUnderY = Math.max(...leftEyeBottom.map(p => p.y)) * height + 5;
  const leftUnderX = (Math.min(...leftEyeBottom.map(p => p.x)) + Math.max(...leftEyeBottom.map(p => p.x))) / 2 * width;
  const rightUnderY = Math.max(...rightEyeBottom.map(p => p.y)) * height + 5;
  const rightUnderX = (Math.min(...rightEyeBottom.map(p => p.x)) + Math.max(...rightEyeBottom.map(p => p.x))) / 2 * width;

  const leftUnderRgb = getRegionAvgColor(imageData, leftUnderX, leftUnderY, 8, width, height);
  const rightUnderRgb = getRegionAvgColor(imageData, rightUnderX, rightUnderY, 8, width, height);

  const leftCheekRgb = getRegionAvgColor(
    imageData,
    landmarks[LEFT_CHEEK].x * width,
    landmarks[LEFT_CHEEK].y * height,
    15, width, height
  );
  const rightCheekRgb = getRegionAvgColor(
    imageData,
    landmarks[RIGHT_CHEEK].x * width,
    landmarks[RIGHT_CHEEK].y * height,
    15, width, height
  );

  const underLab = rgbToLab(
    (leftUnderRgb[0] + rightUnderRgb[0]) / 2,
    (leftUnderRgb[1] + rightUnderRgb[1]) / 2,
    (leftUnderRgb[2] + rightUnderRgb[2]) / 2
  );
  const cheekLab = rgbToLab(
    (leftCheekRgb[0] + rightCheekRgb[0]) / 2,
    (leftCheekRgb[1] + rightCheekRgb[1]) / 2,
    (leftCheekRgb[2] + rightCheekRgb[2]) / 2
  );

  const deltaE = Math.hypot(
    cheekLab[0] - underLab[0],
    cheekLab[1] - underLab[1],
    cheekLab[2] - underLab[2]
  );
  const brightnessDiff = cheekLab[0] - underLab[0];

  return { deltaE, brightnessDiff };
}

function headNodRatio(noseYSeries: number[], fps: number): number {
  if (noseYSeries.length < fps * 2) return 0;

  const mean = noseYSeries.reduce((a, b) => a + b, 0) / noseYSeries.length;
  const detrended = noseYSeries.map(v => v - mean);

  // Simple power ratio: variance in nodding band vs total
  // With short data, use autocorrelation instead of FFT
  const n = detrended.length;
  let totalVar = 0;
  let noddingVar = 0;

  for (let i = 0; i < n; i++) totalVar += detrended[i] * detrended[i];

  // Nodding: check for oscillations at 0.3-2Hz
  // At 30fps, that's lag 15-100 frames
  const minLag = Math.floor(fps / 2);  // 2Hz
  const maxLag = Math.floor(fps / 0.3); // 0.3Hz

  for (let lag = minLag; lag <= Math.min(maxLag, n - 1); lag++) {
    let corr = 0;
    for (let i = 0; i < n - lag; i++) {
      corr += detrended[i] * detrended[i + lag];
    }
    noddingVar += Math.abs(corr / (n - lag));
  }

  const totalNorm = totalVar / n;
  return totalNorm > 0 ? Math.min(1, noddingVar / ((maxLag - minLag + 1) * totalNorm)) : 0;
}

function estimateHoursAwake(drowsiness: number, hourOfDay: number): number {
  const tau = 18.2;
  const cAmp = 0.12;
  const cPhase = 16.0;
  const C = cAmp * Math.cos(2 * Math.PI * (hourOfDay - cPhase) / 24);
  const S = Math.max(0.001, Math.min(0.999, drowsiness + C));
  return Math.max(0, -tau * Math.log(1 - S));
}

export function analyzeFatigue(
  earSeries: number[],
  noseYSeries: number[],
  colorSamples: Array<{ deltaE: number; brightnessDiff: number }>,
  fps: number
): FatigueResult {
  const earAvg = earSeries.reduce((a, b) => a + b, 0) / earSeries.length;
  const sorted = [...earSeries].sort((a, b) => a - b);
  const earP80 = sorted[Math.floor(sorted.length * 0.8)];

  const perclos = computePERCLOS(earSeries);
  const blinks = computeBlinkMetrics(earSeries, fps);
  const nodRatio = headNodRatio(noseYSeries, fps);

  // Average color metrics
  const avgDeltaE = colorSamples.length > 0
    ? colorSamples.reduce((a, b) => a + b.deltaE, 0) / colorSamples.length : 0;
  const avgBrightDiff = colorSamples.length > 0
    ? colorSamples.reduce((a, b) => a + b.brightnessDiff, 0) / colorSamples.length : 0;

  // Signal activations (all sigmoid, no if/elif)
  const dEar = Math.max(0, Math.min(1, (1 - earAvg / earP80) * 3));
  const dColor = sigmoid(avgDeltaE, 10, 0.15);
  const dBright = avgBrightDiff > 0 ? sigmoid(avgBrightDiff, 5, 0.2) : 0;
  const dPerclos = sigmoid(perclos, 0.08, 40);
  const dBlink = sigmoid(blinks.meanDurationMs, 200, 0.015);
  const dSlow = sigmoid(blinks.slowBlinkRatio, 0.3, 5);
  const dNod = sigmoid(nodRatio, 0.3, 8);

  // Two-Process
  const dCumulative = 0.5 * dColor + 0.5 * dBright;
  const dAcute = 0.3 * dEar + 0.35 * dPerclos + 0.2 * dBlink + 0.15 * dSlow;
  const drowsinessForInverse = 0.7 * dCumulative + 0.3 * dAcute;

  const now = new Date();
  const hourDecimal = now.getHours() + now.getMinutes() / 60;
  const hoursAwake = estimateHoursAwake(drowsinessForInverse, hourDecimal);
  const dTP = sigmoid(hoursAwake, 16, 0.15);

  // Weights
  const weights: Record<string, number> = {
    ear: 0.08, color: 0.18, bright: 0.12,
    perclos: 0.12, blink: 0.10, slow: 0.06,
    sdbi: 0.04, nod: 0.05, twoProcess: 0.25
  };
  const totalW = Object.values(weights).reduce((a, b) => a + b, 0);
  Object.keys(weights).forEach(k => weights[k] /= totalW);

  const components: Record<string, number> = {
    'EAR': dEar,
    'Dark Circles': dColor,
    'Brightness': dBright,
    'PERCLOS': dPerclos,
    'Blink Duration': dBlink,
    'Slow Blinks': dSlow,
    'Head Movement': dNod,
    'Circadian': dTP,
  };

  const drowsiness =
    weights.ear * dEar + weights.color * dColor + weights.bright * dBright +
    weights.perclos * dPerclos + weights.blink * dBlink + weights.slow * dSlow +
    weights.nod * dNod + weights.twoProcess * dTP;

  const kss = Math.round((1 + drowsiness * 8) * 10) / 10;
  const fatigueScore = Math.round(drowsiness * 100);
  const estimatedSleepHours = Math.round(Math.max(0, 24 - hoursAwake) * 10) / 10;

  // Should sleep score
  let shouldSleep = fatigueScore * 0.5 + dColor * 25 + dBright * 10;
  if (perclos > 0.08) shouldSleep += 10;
  if (blinks.meanDurationMs > 200) shouldSleep += 5;
  shouldSleep = Math.min(100, Math.round(shouldSleep));

  // Recommendation
  let recommendation: string;
  if (shouldSleep >= 70) {
    recommendation = '今すぐ休んでください。認知機能がアルコール摂取時と同等レベルまで低下しています。';
  } else if (shouldSleep >= 50) {
    recommendation = 'かなり疲労が蓄積しています。30分以内に休憩を取ることを推奨します。';
  } else if (shouldSleep >= 30) {
    recommendation = '軽度の疲労が見られます。1-2時間後に15分の休憩を挟みましょう。';
  } else {
    recommendation = 'コンディション良好です。このまま集中を続けられます。';
  }

  return {
    fatigueScore,
    kss,
    estimatedSleepHours,
    shouldSleepScore: shouldSleep,
    signals: {
      earAvg: Math.round(earAvg * 1000) / 1000,
      perclos: Math.round(perclos * 10000) / 10000,
      blinkCount: blinks.count,
      meanBlinkDurationMs: Math.round(blinks.meanDurationMs),
      slowBlinkRatio: Math.round(blinks.slowBlinkRatio * 100) / 100,
      darkCircleDeltaE: Math.round(avgDeltaE * 10) / 10,
      brightnessDiff: Math.round(avgBrightDiff * 10) / 10,
      headNodRatio: Math.round(nodRatio * 1000) / 1000,
    },
    components,
    recommendation,
    timestamp: Date.now(),
  };
}
