'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[4/3] rounded-2xl flex items-center justify-center" style={{ background: '#0d1117' }}>
      <div className="text-gray-500 text-sm tracking-wide">読み込み中</div>
    </div>
  ),
});

const FatigueReceipt = dynamic(() => import('@/components/FatigueReceipt'), { ssr: false });

// Color per state - Oura-inspired
const stateColors = {
  fatigue: '#E85D75',    // warm red
  sleep: '#7B61FF',      // purple
  kss: '#F5A623',        // amber
  darkCircle: '#6282E3', // blue
  ok: '#4CAF82',         // green
};

export default function PatternB() {
  const [result, setResult] = useState<FatigueResult | null>(null);

  return (
    <main className="min-h-screen" style={{ background: '#0a0d14', color: '#e8e6e1' }}>
      <div className="max-w-md mx-auto px-5 py-8">
        {!result ? (
          <>
            {/* Header - Calm/Oura hybrid */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                {/* Custom logo mark - not emoji */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1a1f2e' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <path d="M6 12 Q9 14 12 12 Q15 10 18 12" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 12 L8 14" stroke="#7B61FF" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 12 L12 14" stroke="#7B61FF" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M16 12 L16 14" stroke="#7B61FF" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-medium tracking-wide" style={{ fontFamily: 'Inter, "Noto Sans JP", sans-serif' }}>
                    つかれみる
                  </h1>
                </div>
              </div>
              <p className="text-2xl font-light leading-snug tracking-tight" style={{ color: '#c8c4bc', fontFamily: '"Noto Serif JP", serif' }}>
                顔は、嘘をつかない。
              </p>
              <p className="text-sm mt-2" style={{ color: '#6b6860' }}>
                カメラで5秒。あなたの疲れを、8つの信号から読み取ります。
              </p>
            </header>

            {/* Scanner */}
            <div className="mb-8">
              <FatigueScanner onResult={setResult} />
            </div>

            {/* Sample data - Oura-style cards */}
            <section className="mb-8">
              <div className="text-xs tracking-[0.15em] mb-4" style={{ color: '#4a473f' }}>
                SAMPLE READING
              </div>

              {/* Main score card */}
              <div className="rounded-2xl p-5 mb-3" style={{ background: '#111620' }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs tracking-wider" style={{ color: '#6b6860' }}>疲労度</div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-5xl font-light" style={{ fontFamily: '"JetBrains Mono", monospace', color: stateColors.fatigue }}>73</span>
                      <span className="text-sm" style={{ color: '#4a473f' }}>/100</span>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full text-xs" style={{ background: '#E85D7515', color: stateColors.fatigue }}>
                    休息推奨
                  </div>
                </div>
                <div className="w-full h-1 rounded-full" style={{ background: '#1a1f2e' }}>
                  <div className="h-1 rounded-full transition-all" style={{ width: '73%', background: `linear-gradient(90deg, ${stateColors.ok}, ${stateColors.kss}, ${stateColors.fatigue})` }} />
                </div>
              </div>

              {/* Sub metrics */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '推定睡眠', value: '1.8', unit: 'h', color: stateColors.sleep },
                  { label: '眠気', value: '7.9', unit: '/9', color: stateColors.kss },
                  { label: '目の下', value: '99', unit: '%', color: stateColors.darkCircle },
                ].map(({ label, value, unit, color }) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: '#111620' }}>
                    <div className="text-[10px] tracking-wider mb-2" style={{ color: '#4a473f' }}>{label}</div>
                    <div className="flex items-baseline">
                      <span className="text-xl font-light" style={{ fontFamily: 'monospace', color }}>{value}</span>
                      <span className="text-xs ml-0.5" style={{ color: '#4a473f' }}>{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* How it works - minimal, no emoji */}
            <section className="mb-8">
              <div className="text-xs tracking-[0.15em] mb-4" style={{ color: '#4a473f' }}>
                HOW IT WORKS
              </div>
              <div className="space-y-4">
                {[
                  { n: '01', title: '撮影', desc: 'カメラに5秒向けるだけ' },
                  { n: '02', title: '解析', desc: 'PERCLOS、瞬き、クマ、サーカディアンモデルなど8信号' },
                  { n: '03', title: '結果', desc: '疲労スコアと行動アドバイス' },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="flex gap-4">
                    <div className="text-xs font-light" style={{ fontFamily: 'monospace', color: '#7B61FF', minWidth: '20px' }}>{n}</div>
                    <div>
                      <div className="text-sm" style={{ color: '#c8c4bc' }}>{title}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#4a473f' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Trust bar */}
            <footer className="flex items-center justify-center gap-4 py-6 border-t" style={{ borderColor: '#1a1f2e' }}>
              <div className="flex items-center gap-1.5">
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" style={{ color: '#4a473f' }}>
                  <rect x="2" y="6" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M5 6V4a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
                <span className="text-[10px]" style={{ color: '#4a473f' }}>ブラウザ内処理</span>
              </div>
              <div className="w-px h-3" style={{ background: '#1a1f2e' }} />
              <span className="text-[10px]" style={{ color: '#4a473f' }}>論文ベース</span>
              <div className="w-px h-3" style={{ background: '#1a1f2e' }} />
              <span className="text-[10px]" style={{ color: '#4a473f' }}>OSS</span>
            </footer>
          </>
        ) : (
          <FatigueReceipt result={result} onReset={() => setResult(null)} />
        )}
      </div>
    </main>
  );
}
