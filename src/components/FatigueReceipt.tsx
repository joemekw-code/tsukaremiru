'use client';

import { useRef, useCallback } from 'react';
import type { FatigueResult } from '@/lib/fatigue-engine';

interface Props {
  result: FatigueResult;
  onReset: () => void;
}

function Bar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-red-400';
  if (score >= 50) return 'text-orange-400';
  if (score >= 30) return 'text-yellow-400';
  return 'text-emerald-400';
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-red-500';
  if (score >= 50) return 'bg-orange-500';
  if (score >= 30) return 'bg-yellow-500';
  return 'bg-emerald-500';
}

function getKSSLabel(kss: number): string {
  if (kss >= 8) return 'Fighting Sleep';
  if (kss >= 7) return 'Sleepy';
  if (kss >= 5) return 'Neither';
  if (kss >= 3) return 'Alert';
  return 'Very Alert';
}

export default function FatigueReceipt({ result, onReset }: Props) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const shareToTwitter = useCallback(() => {
    const text = `疲労度: ${result.fatigueScore}/100 | 推定睡眠: ${result.estimatedSleepHours}h | 寝るべき度: ${result.shouldSleepScore}/100\n\n顔は嘘をつかない。5秒でわかる疲労チェック`;
    const url = typeof window !== 'undefined' ? window.location.origin : '';
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  }, [result]);

  const date = new Date(result.timestamp);
  const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Receipt card */}
      <div
        ref={receiptRef}
        className="bg-gray-950 border border-gray-800 rounded-2xl p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center border-b border-dashed border-gray-700 pb-4 mb-4">
          <h2 className="text-xl font-bold text-white tracking-wider">FATIGUE RECEIPT</h2>
          <p className="text-gray-500 text-xs mt-1 font-mono">{dateStr}</p>
        </div>

        {/* Main scores */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-gray-400 text-sm">疲労度</span>
              <span className={`text-3xl font-bold font-mono ${getScoreColor(result.fatigueScore)}`}>
                {result.fatigueScore}<span className="text-lg text-gray-600">/100</span>
              </span>
            </div>
            <Bar value={result.fatigueScore} color={getScoreBarColor(result.fatigueScore)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-xl p-3">
              <div className="text-gray-500 text-xs mb-1">推定睡眠</div>
              <div className="text-2xl font-bold font-mono text-white">
                {result.estimatedSleepHours}<span className="text-sm text-gray-500">h</span>
              </div>
            </div>
            <div className="bg-gray-900 rounded-xl p-3">
              <div className="text-gray-500 text-xs mb-1">寝るべき度</div>
              <div className={`text-2xl font-bold font-mono ${getScoreColor(result.shouldSleepScore)}`}>
                {result.shouldSleepScore}<span className="text-sm text-gray-600">/100</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">KSS (眠気スケール)</span>
              <span className="text-gray-600 text-xs">{getKSSLabel(result.kss)}</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {result.kss}<span className="text-sm text-gray-600">/9</span>
            </div>
          </div>
        </div>

        {/* Signal breakdown */}
        <div className="border-t border-dashed border-gray-700 pt-4 mb-4">
          <div className="text-gray-500 text-xs mb-3 font-medium">SIGNAL BREAKDOWN</div>
          <div className="space-y-2">
            {Object.entries(result.components).map(([name, value]) => (
              <div key={name} className="flex items-center gap-2">
                <span className="text-gray-500 text-xs w-28 shrink-0">{name}</span>
                <div className="flex-1">
                  <Bar
                    value={value}
                    max={1}
                    color={value > 0.7 ? 'bg-red-500/70' : value > 0.4 ? 'bg-yellow-500/70' : 'bg-emerald-500/70'}
                  />
                </div>
                <span className="text-gray-500 text-xs font-mono w-10 text-right">
                  {(value * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div className="border-t border-dashed border-gray-700 pt-4">
          <div className={`text-sm ${getScoreColor(result.shouldSleepScore)} font-medium`}>
            {result.recommendation}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 pt-3 border-t border-dashed border-gray-700">
          <div className="text-gray-600 text-xs font-mono">joemekw-code.github.io/tsukaremiru</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={shareToTwitter}
          className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl
                     transition-all text-sm border border-gray-700"
        >
          Xでシェア
        </button>
        <button
          onClick={onReset}
          className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl
                     transition-all text-sm"
        >
          もう一度スキャン
        </button>
      </div>
    </div>
  );
}
