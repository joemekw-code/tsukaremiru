'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => <div className="w-full h-full" style={{ background: '#0c0f18' }} />,
});

/* ── C: ガジェットオタク / Oura競合 ──
   28歳ITエンジニア。Oura Ring買おうか迷ってる。
   「無料でここまで出るの？」という驚き。
   ダーク×グリーン（ヘルス）、データ密度高め、英語混じり。 */

function Ring({ score, size = 160 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const color = score >= 60 ? '#e06060' : score >= 35 ? '#d4a040' : '#4caf82';
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#141824" strokeWidth="5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
              strokeDasharray={c} strokeDashoffset={c - (score/100)*c}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}/>
    </svg>
  );
}

function MiniBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div className="flex-1">
      <div className="flex justify-between mb-1">
        <span className="text-[9px] tracking-wider" style={{ color: '#4a4650' }}>{label}</span>
        <span className="text-[9px]" style={{ color, fontFamily: 'monospace' }}>{value}%</span>
      </div>
      <div className="h-1 rounded-full" style={{ background: '#141824' }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color, transition: 'width 1s ease-out' }} />
      </div>
    </div>
  );
}

export default function PatternC() {
  const [result, setResult] = useState<FatigueResult | null>(null);

  return (
    <main className="h-[100dvh] flex flex-col overflow-hidden"
          style={{ background: '#0c0f18', color: '#d0ccc4', fontFamily: 'Inter, "Noto Sans JP", sans-serif' }}>

      {!result ? (
        <>
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 pt-14 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#4caf82' }} />
              <span className="text-xs font-medium">nemumi</span>
            </div>
            <span className="text-[9px]" style={{ color: '#2a2e3a' }}>v1.0 / 8 biomarkers</span>
          </div>

          {/* Camera - main */}
          <div className="flex-1 mx-3 mb-2 rounded-2xl overflow-hidden" style={{ border: '1px solid #1a1e28' }}>
            <FatigueScanner onResult={setResult} />
          </div>

          {/* Bottom info bar */}
          <div className="px-4 pb-8 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                {['PERCLOS', 'EAR', 'Blink', 'Color'].map(s => (
                  <div key={s} className="text-[8px] tracking-wider" style={{ color: '#2a2e3a' }}>{s}</div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <svg viewBox="0 0 12 12" className="w-3 h-3" style={{ color: '#2a2e3a' }}>
                  <rect x="1.5" y="4" width="9" height="6" rx="1.5" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <path d="M4 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1" fill="none"/>
                </svg>
                <span className="text-[8px]" style={{ color: '#2a2e3a' }}>local only</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Result - Oura-style dashboard */
        <div className="h-full flex flex-col pt-14 px-4 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium">nemumi</span>
            <span className="text-[9px] px-2.5 py-1 rounded-full" style={{
              background: result.fatigueScore >= 60 ? '#e0606015' : result.fatigueScore >= 35 ? '#d4a04015' : '#4caf8215',
              color: result.fatigueScore >= 60 ? '#e06060' : result.fatigueScore >= 35 ? '#d4a040' : '#4caf82'
            }}>
              {result.fatigueScore >= 60 ? 'Poor' : result.fatigueScore >= 35 ? 'Fair' : 'Good'}
            </span>
          </div>

          {/* Ring + score */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Ring score={result.fatigueScore} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[9px] tracking-wider" style={{ color: '#4a4650' }}>FATIGUE</span>
                <span className="text-3xl font-light" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  {result.fatigueScore}
                </span>
              </div>
            </div>
          </div>

          {/* Contributors - horizontal bars */}
          <div className="rounded-xl p-4 mb-4" style={{ background: '#10131c' }}>
            <div className="text-[9px] tracking-[0.1em] mb-3" style={{ color: '#3a3e4a' }}>CONTRIBUTORS</div>
            <div className="space-y-3">
              <MiniBar label="DARK CIRCLES" value={Math.round(result.components['Dark Circles'] * 100)} color="#7b61ff" />
              <MiniBar label="PERCLOS" value={Math.round(result.components['PERCLOS'] * 100)} color="#e06060" />
              <MiniBar label="BLINK DUR." value={Math.round(result.components['Blink Duration'] * 100)} color="#f5a623" />
              <MiniBar label="CIRCADIAN" value={Math.round(result.components['Circadian'] * 100)} color="#4caf82" />
            </div>
          </div>

          {/* Key metrics */}
          <div className="flex gap-2 mb-4">
            {[
              { label: 'Est. Sleep', value: `${result.estimatedSleepHours}h`, color: '#7b61ff' },
              { label: 'KSS', value: `${result.kss}/9`, color: '#f5a623' },
              { label: 'Should Rest', value: `${result.shouldSleepScore}%`, color: '#e06060' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex-1 rounded-xl p-3" style={{ background: '#10131c' }}>
                <div className="text-[8px] tracking-wider mb-1" style={{ color: '#3a3e4a' }}>{label}</div>
                <div className="text-sm font-light" style={{ fontFamily: 'monospace', color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            <button onClick={() => setResult(null)}
                    className="flex-1 text-[10px] py-2.5 rounded-xl tracking-wider"
                    style={{ background: '#141824', color: '#5a5e6a' }}>
              RESCAN
            </button>
            <button onClick={() => {
              const t = `Fatigue: ${result.fatigueScore}/100 | Sleep: ${result.estimatedSleepHours}h | KSS: ${result.kss}/9`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(location.origin + '/c')}`, '_blank');
            }}
                    className="flex-1 text-[10px] py-2.5 rounded-xl tracking-wider"
                    style={{ background: '#4caf82', color: '#0c0f18' }}>
              SHARE
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
