/**
 * Generate a shareable receipt image using Canvas API
 * Dark theme, compact, visually striking for social media
 */

import type { FatigueResult } from './fatigue-engine';

const WIDTH = 600;
const HEIGHT = 800;

function getScoreHex(score: number): string {
  if (score >= 70) return '#f87171';
  if (score >= 50) return '#fb923c';
  if (score >= 30) return '#facc15';
  return '#34d399';
}

export async function generateReceiptImage(result: FatigueResult): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Border
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 2;
  ctx.roundRect(10, 10, WIDTH - 20, HEIGHT - 20, 16);
  ctx.stroke();

  let y = 50;

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('FATIGUE RECEIPT', WIDTH / 2, y);
  y += 25;

  // Date
  const date = new Date(result.timestamp);
  const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  ctx.fillStyle = '#6b7280';
  ctx.font = '14px monospace';
  ctx.fillText(dateStr, WIDTH / 2, y);
  y += 20;

  // Dashed line
  drawDashedLine(ctx, 30, y, WIDTH - 30, y);
  y += 30;

  // Fatigue score - big number
  ctx.textAlign = 'left';
  ctx.fillStyle = '#9ca3af';
  ctx.font = '16px sans-serif';
  ctx.fillText('疲労度', 40, y);

  ctx.textAlign = 'right';
  ctx.fillStyle = getScoreHex(result.fatigueScore);
  ctx.font = 'bold 48px monospace';
  ctx.fillText(`${result.fatigueScore}`, WIDTH - 100, y + 10);
  ctx.fillStyle = '#4b5563';
  ctx.font = '20px monospace';
  ctx.fillText('/100', WIDTH - 40, y + 10);
  y += 25;

  // Fatigue bar
  drawBar(ctx, 40, y, WIDTH - 80, 12, result.fatigueScore / 100, getScoreHex(result.fatigueScore));
  y += 35;

  // Sleep and Should-sleep side by side
  const boxW = (WIDTH - 100) / 2;

  // Sleep box
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.roundRect(40, y, boxW, 70, 12);
  ctx.fill();
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('推定睡眠', 55, y + 22);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px monospace';
  ctx.fillText(`${result.estimatedSleepHours}h`, 55, y + 55);

  // Should-sleep box
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.roundRect(40 + boxW + 20, y, boxW, 70, 12);
  ctx.fill();
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('寝るべき度', 55 + boxW + 20, y + 22);
  ctx.fillStyle = getScoreHex(result.shouldSleepScore);
  ctx.font = 'bold 28px monospace';
  ctx.fillText(`${result.shouldSleepScore}/100`, 55 + boxW + 20, y + 55);
  y += 95;

  // KSS
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.roundRect(40, y, WIDTH - 80, 55, 12);
  ctx.fill();
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('KSS (Karolinska Sleepiness Scale)', 55, y + 22);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(`${result.kss}/9`, 55, y + 45);
  y += 75;

  // Dashed line
  drawDashedLine(ctx, 30, y, WIDTH - 30, y);
  y += 20;

  // Signal breakdown
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SIGNAL BREAKDOWN', 40, y);
  y += 18;

  const entries = Object.entries(result.components);
  for (const [name, value] of entries) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(name, 40, y);

    const barColor = value > 0.7 ? '#ef4444aa' : value > 0.4 ? '#eab308aa' : '#10b981aa';
    drawBar(ctx, 180, y - 8, 300, 8, value, barColor);

    ctx.fillStyle = '#6b7280';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(value * 100)}%`, WIDTH - 40, y);
    y += 22;
  }

  y += 5;

  // Dashed line
  drawDashedLine(ctx, 30, y, WIDTH - 30, y);
  y += 18;

  // Recommendation (truncate if needed)
  ctx.fillStyle = getScoreHex(result.shouldSleepScore);
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'left';
  const rec = result.recommendation;
  if (rec.length > 40) {
    ctx.fillText(rec.slice(0, 38) + '...', 40, y);
  } else {
    ctx.fillText(rec, 40, y);
  }
  y += 25;

  // Footer
  drawDashedLine(ctx, 30, y, WIDTH - 30, y);
  y += 20;
  ctx.fillStyle = '#4b5563';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('joemekw-code.github.io/tsukaremiru', WIDTH / 2, y);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png');
  });
}

function drawDashedLine(ctx: CanvasRenderingContext2D, x1: number, y: number, x2: number, _y2: number) {
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, pct: number, color: string) {
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();

  if (pct > 0) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, Math.max(h, w * Math.min(1, pct)), h, h / 2);
    ctx.fill();
  }
}
