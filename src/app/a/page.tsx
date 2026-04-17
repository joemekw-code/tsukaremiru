'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});
const FatigueReceipt = dynamic(() => import('@/components/FatigueReceipt'), { ssr: false });

/* ── Pattern A: ゆるかわマスコット ──
   Yuru-kawa mascot that changes expression based on state.
   M PLUS Rounded 1c, muted pastels, warm.
   The mascot IS the brand. Camera is secondary. */

function Mascot({ state }: { state: 'idle' | 'scanning' | 'tired' | 'ok' }) {
  // Custom SVG mascot - a small round creature with droopy eyes
  // NOT emoji, NOT stock. Hand-drawn feel with intentional wobble.
  return (
    <svg viewBox="0 0 120 120" className="w-24 h-24" fill="none">
      {/* Body - slightly imperfect circle (organic feel) */}
      <path d="M60 10 C90 10 110 30 110 60 C110 90 90 110 60 110 C30 110 10 90 10 60 C10 30 30 10 60 10Z"
            fill="#f0e6d8" stroke="#d4c0a8" strokeWidth="1.5"/>
      {/* Blush */}
      <ellipse cx="35" cy="68" rx="8" ry="5" fill="#f0c4c0" opacity="0.5"/>
      <ellipse cx="85" cy="68" rx="8" ry="5" fill="#f0c4c0" opacity="0.5"/>

      {state === 'idle' && <>
        {/* Neutral closed eyes */}
        <path d="M38 55 Q45 58 52 55" stroke="#7a6b5a" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M68 55 Q75 58 82 55" stroke="#7a6b5a" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M50 72 Q60 76 70 72" stroke="#7a6b5a" strokeWidth="2" strokeLinecap="round"/>
      </>}

      {state === 'scanning' && <>
        {/* One eye open, one squinting - curious */}
        <circle cx="45" cy="52" r="4" fill="#7a6b5a"/>
        <path d="M68 55 Q75 58 82 55" stroke="#7a6b5a" strokeWidth="2.5" strokeLinecap="round"/>
        <ellipse cx="60" cy="74" rx="4" ry="3" fill="#7a6b5a" opacity="0.3"/>
      </>}

      {state === 'tired' && <>
        {/* Very droopy, barely open */}
        <path d="M36 58 Q45 54 54 58" stroke="#7a6b5a" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M66 58 Q75 54 84 58" stroke="#7a6b5a" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M52 74 Q60 70 68 74" stroke="#7a6b5a" strokeWidth="1.5" strokeLinecap="round"/>
        {/* zzz */}
        <text x="88" y="35" fontSize="12" fill="#b8a88a" fontFamily="sans-serif" fontWeight="600">z</text>
        <text x="95" y="25" fontSize="10" fill="#d0c4b4" fontFamily="sans-serif" fontWeight="600">z</text>
      </>}

      {state === 'ok' && <>
        {/* Happy, slightly open */}
        <path d="M38 52 Q45 48 52 52" stroke="#7a6b5a" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M68 52 Q75 48 82 52" stroke="#7a6b5a" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M48 72 Q60 80 72 72" stroke="#7a6b5a" strokeWidth="2" strokeLinecap="round"/>
      </>}
    </svg>
  );
}

export default function PatternA() {
  const [result, setResult] = useState<FatigueResult | null>(null);
  const [scanning, setScanning] = useState(false);

  return (
    <main className="h-[100dvh] flex flex-col overflow-hidden"
          style={{ background: '#f5efe6', fontFamily: '"M PLUS Rounded 1c", "Noto Sans JP", sans-serif' }}>

      {!result ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Mascot - the hero */}
          <div className="mb-4">
            <Mascot state={scanning ? 'scanning' : 'idle'} />
          </div>

          {/* Brand */}
          <h1 className="text-xl font-bold tracking-wide mb-1" style={{ color: '#4a3f35' }}>
            つかれみる
          </h1>
          <p className="text-xs mb-6" style={{ color: '#a89880', letterSpacing: '0.05em' }}>
            顔を5秒見せてね。疲れ具合、測るよ。
          </p>

          {/* Camera - compact */}
          <div className="w-full max-w-[280px] aspect-[4/3] rounded-2xl overflow-hidden mb-5"
               style={{ background: '#ece4d8', border: '2px solid #e0d4c4' }}>
            <FatigueScanner onResult={(r) => { setScanning(false); setResult(r); }} />
          </div>

          {/* Trust line */}
          <p className="text-[10px] tracking-wider" style={{ color: '#c8b8a4' }}>
            映像は送信しません / 論文ベース
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <Mascot state={result.fatigueScore >= 50 ? 'tired' : 'ok'} />
          <div className="mt-4 text-center">
            <div className="text-xs mb-1" style={{ color: '#a89880' }}>疲労度</div>
            <div className="text-5xl font-bold" style={{
              color: result.fatigueScore >= 70 ? '#c85a50' : result.fatigueScore >= 40 ? '#c8a050' : '#6aac7a',
              fontFamily: '"JetBrains Mono", monospace'
            }}>
              {result.fatigueScore}
            </div>
            <div className="text-xs mt-2 mb-4" style={{ color: '#8a7a68' }}>
              {result.recommendation}
            </div>
            <button onClick={() => setResult(null)}
                    className="text-xs px-5 py-2 rounded-full"
                    style={{ background: '#e8dcd0', color: '#6a5a48' }}>
              もう一回
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
