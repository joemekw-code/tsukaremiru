'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => <div className="w-full h-full rounded-3xl" style={{ background: '#151a2e' }} />,
});
const FatigueReceipt = dynamic(() => import('@/components/FatigueReceipt'), { ssr: false });

/* ── Pattern C: データビジュアル型 (Oura完全模倣) ──
   Deep navy, color = meaning, ring charts, large numbers.
   Premium/professional. Oura + Apple Health hybrid.
   One big score. Supporting data on tap. */

function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#E85D75' : score >= 40 ? '#F5A623' : '#4CAF82';

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1f2e" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
              strokeDasharray={circumference} strokeDashoffset={offset}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
    </svg>
  );
}

export default function PatternC() {
  const [result, setResult] = useState<FatigueResult | null>(null);

  return (
    <main className="h-[100dvh] flex flex-col overflow-hidden"
          style={{ background: '#0a0d14', color: '#e8e6e1', fontFamily: 'Inter, "Noto Sans JP", sans-serif' }}>

      {!result ? (
        <div className="flex-1 flex flex-col">
          {/* Header bar */}
          <div className="flex items-center justify-between px-5 pt-14 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#1a1f2e' }}>
                <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="#7B61FF" strokeWidth="1.5"/>
                  <path d="M7 10h6" stroke="#7B61FF" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-sm font-medium tracking-wide">つかれみる</span>
            </div>
            <div className="text-[9px] tracking-[0.1em]" style={{ color: '#4a473f' }}>v1.0</div>
          </div>

          {/* Camera - main area */}
          <div className="flex-1 px-4 pb-3">
            <div className="w-full h-full rounded-3xl overflow-hidden" style={{ background: '#111620' }}>
              <FatigueScanner onResult={setResult} />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="px-5 pb-8 pt-2">
            <div className="flex items-center justify-center gap-3">
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" style={{ color: '#4a473f' }}>
                <rect x="2" y="6" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M5 6V4a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              <span className="text-[10px]" style={{ color: '#4a473f' }}>ブラウザ内処理 / 論文ベース</span>
            </div>
          </div>
        </div>
      ) : (
        /* Result screen - Oura style ring + data */
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Ring with score in center */}
          <div className="relative mb-6">
            <ScoreRing score={result.fatigueScore} size={180} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[10px] tracking-[0.15em] mb-1" style={{ color: '#6b6860' }}>FATIGUE</div>
              <div className="text-4xl font-light" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                {result.fatigueScore}
              </div>
            </div>
          </div>

          {/* Sub metrics - horizontal */}
          <div className="flex gap-5 mb-6">
            {[
              { label: '睡眠', value: `${result.estimatedSleepHours}h`, color: '#7B61FF' },
              { label: '眠気', value: `${result.kss}/9`, color: '#F5A623' },
              { label: '目の下', value: `${Math.round(result.components['Dark Circles'] * 100)}%`, color: '#6282E3' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className="text-[9px] tracking-wider mb-1" style={{ color: '#4a473f' }}>{label}</div>
                <div className="text-base font-light" style={{ fontFamily: 'monospace', color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className="text-xs text-center mb-6" style={{ color: '#6b6860', maxWidth: '260px', lineHeight: '1.7' }}>
            {result.recommendation}
          </div>

          <button onClick={() => setResult(null)}
                  className="text-xs px-5 py-2 rounded-full transition-colors"
                  style={{ background: '#1a1f2e', color: '#8a8580' }}>
            もう一度
          </button>
        </div>
      )}
    </main>
  );
}
