'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => <div className="w-full h-full rounded-2xl" style={{ background: '#13162a' }} />,
});

/* ── Pattern C: ねむみ — プレミアムデータ ──
   Persona: 意識高め。Oura Ring買おうか迷ってる人。
   Emotion: 「無料でここまで出るの？」という驚き。
   Visual: 深い紺、リングチャート、ゴールドアクセント、ミニマルラグジュアリー */

function Ring({ score, size = 140 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const color = score >= 60 ? '#e06060' : score >= 35 ? '#d4a040' : '#50b070';
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1e30" strokeWidth="5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
              strokeDasharray={c} strokeDashoffset={c - (score/100)*c}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}/>
    </svg>
  );
}

export default function PatternC() {
  const [result, setResult] = useState<FatigueResult | null>(null);

  return (
    <main className="h-[100dvh] flex flex-col overflow-hidden"
          style={{ background: '#0c0f1a', color: '#d8d4cc', fontFamily: '"Noto Sans JP", sans-serif' }}>

      {!result ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-14 pb-2">
            <div>
              <h1 className="text-sm font-medium tracking-widest" style={{ color: '#d4c8a8' }}>NEMUMI</h1>
            </div>
            <div className="text-[9px] tracking-wider" style={{ color: '#3a3840' }}>
              fatigue analysis
            </div>
          </div>

          {/* Camera - takes most space */}
          <div className="flex-1 px-4 pb-2">
            <div className="w-full h-full rounded-2xl overflow-hidden" style={{ border: '1px solid #1a1e30' }}>
              <FatigueScanner onResult={setResult} />
            </div>
          </div>

          {/* Bottom */}
          <div className="px-5 pb-8 pt-2 text-center">
            <p className="text-[9px] tracking-wider" style={{ color: '#3a3840' }}>
              browser-only / peer-reviewed algorithms
            </p>
          </div>
        </>
      ) : (
        /* Result - premium data display */
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <p className="text-[10px] tracking-[0.2em] mb-4" style={{ color: '#3a3840' }}>
            FATIGUE ANALYSIS
          </p>

          <div className="relative mb-5">
            <Ring score={result.fatigueScore} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-light" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                {result.fatigueScore}
              </span>
            </div>
          </div>

          <div className="flex gap-8 mb-6">
            {[
              { label: 'SLEEP', value: `${result.estimatedSleepHours}h`, color: '#8878c8' },
              { label: 'ALERT', value: `${result.kss}/9`, color: '#c8a850' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className="text-[8px] tracking-[0.15em] mb-1" style={{ color: '#3a3840' }}>{label}</div>
                <div className="text-lg font-light" style={{ fontFamily: 'monospace', color }}>{value}</div>
              </div>
            ))}
          </div>

          <p className="text-xs text-center mb-6 max-w-[240px]" style={{ color: '#4a4650', lineHeight: '1.8' }}>
            {result.recommendation}
          </p>

          <div className="flex gap-3">
            <button onClick={() => setResult(null)}
                    className="text-[10px] px-5 py-2 rounded-full tracking-wider"
                    style={{ background: '#1a1e30', color: '#6a6470' }}>
              RESCAN
            </button>
            <button onClick={() => {
              const text = `Fatigue score: ${result.fatigueScore}/100`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin + '/c')}`, '_blank');
            }}
                    className="text-[10px] px-5 py-2 rounded-full tracking-wider"
                    style={{ background: '#d4c8a8', color: '#0c0f1a' }}>
              SHARE
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
