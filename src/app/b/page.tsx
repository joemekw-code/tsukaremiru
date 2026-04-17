'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black" />,
});
const FatigueReceipt = dynamic(() => import('@/components/FatigueReceipt'), { ssr: false });

/* ── Pattern B: フルブリードカメラ (TikTok方式) ──
   Camera fills entire viewport. UI overlaid.
   Minimal, cool, adult. No cards. No boxes.
   Everything is positioned absolute over the camera feed. */

export default function PatternB() {
  const [result, setResult] = useState<FatigueResult | null>(null);

  return (
    <main className="h-[100dvh] relative overflow-hidden bg-black"
          style={{ fontFamily: 'Inter, "Noto Sans JP", sans-serif' }}>

      {!result ? (
        <>
          {/* Camera fills everything */}
          <div className="absolute inset-0">
            <FatigueScanner onResult={setResult} />
          </div>

          {/* Overlay UI - top */}
          <div className="absolute top-0 left-0 right-0 pt-14 px-5 z-10"
               style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-white text-base font-medium tracking-wide">つかれみる</h1>
                <p className="text-white/40 text-[10px] tracking-wider mt-0.5">FATIGUE SCANNER</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                   style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-white/60 text-[10px]">ブラウザ内処理</span>
              </div>
            </div>
          </div>

          {/* Overlay UI - bottom */}
          <div className="absolute bottom-0 left-0 right-0 pb-10 px-5 z-10"
               style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
            <p className="text-white/50 text-xs text-center mb-4">
              カメラに5秒向けてください
            </p>
          </div>
        </>
      ) : (
        /* Result - full screen dark with data */
        <div className="h-full flex flex-col justify-center px-6"
             style={{ background: '#0a0d14' }}>
          <div className="text-center">
            <div className="text-white/30 text-xs tracking-[0.2em] mb-2">FATIGUE SCORE</div>
            <div className="text-7xl font-light text-white mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              {result.fatigueScore}
            </div>
            <div className="w-48 h-0.5 mx-auto rounded-full mb-6" style={{ background: '#1a1f2e' }}>
              <div className="h-0.5 rounded-full" style={{
                width: `${result.fatigueScore}%`,
                background: result.fatigueScore >= 70 ? '#E85D75' : result.fatigueScore >= 40 ? '#F5A623' : '#4CAF82'
              }} />
            </div>

            <div className="flex justify-center gap-6 mb-8">
              {[
                { label: 'SLEEP', value: `${result.estimatedSleepHours}h`, color: '#7B61FF' },
                { label: 'KSS', value: `${result.kss}`, color: '#F5A623' },
                { label: 'EYES', value: `${Math.round(result.components['Dark Circles'] * 100)}%`, color: '#6282E3' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <div className="text-[9px] tracking-[0.15em] mb-1" style={{ color: '#4a473f' }}>{label}</div>
                  <div className="text-xl font-light" style={{ fontFamily: 'monospace', color }}>{value}</div>
                </div>
              ))}
            </div>

            <p className="text-white/40 text-xs mb-6">{result.recommendation}</p>

            <button onClick={() => setResult(null)}
                    className="text-xs px-6 py-2.5 rounded-full text-white/70 transition-colors"
                    style={{ background: '#1a1f2e' }}>
              もう一度
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
