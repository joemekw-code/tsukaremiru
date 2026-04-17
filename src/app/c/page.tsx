'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[4/3] rounded-3xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}>
      <div className="text-gray-400 text-sm">読み込み中</div>
    </div>
  ),
});

const FatigueReceipt = dynamic(() => import('@/components/FatigueReceipt'), { ssr: false });

export default function PatternC() {
  const [result, setResult] = useState<FatigueResult | null>(null);

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: '#f5f0eb' }}>
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #ddd0f7, transparent)' }} />
        <div className="absolute top-1/3 -left-20 w-60 h-60 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #f7d0d0, transparent)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #d0e7f7, transparent)' }} />
      </div>

      <div className="relative max-w-md mx-auto px-5 py-10">
        {!result ? (
          <>
            {/* Header */}
            <header className="text-center mb-8">
              {/* Custom SVG mark */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.4)' }}>
                <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
                  <path d="M8 16 Q12 19 16 16 Q20 13 24 16" stroke="#8b7ec8" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="11" cy="18" r="0.8" fill="#8b7ec8"/>
                  <circle cx="16" cy="15" r="0.8" fill="#8b7ec8"/>
                  <circle cx="21" cy="18" r="0.8" fill="#8b7ec8"/>
                </svg>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight mb-2" style={{ color: '#2a2520', fontFamily: '"Noto Sans JP", sans-serif' }}>
                つかれみる
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: '#8a8078', letterSpacing: '0.03em', lineHeight: '1.7' }}>
                カメラに5秒向けるだけ。<br />
                あなたの疲れを、数字にします。
              </p>
            </header>

            {/* Scanner */}
            <div className="mb-8">
              <FatigueScanner onResult={setResult} />
            </div>

            {/* Glass card - sample result */}
            <section className="mb-8">
              <div className="text-xs tracking-wider mb-3 text-center" style={{ color: '#b0a898' }}>
                こんな結果が出ます
              </div>
              <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
                {/* Main score */}
                <div className="text-center mb-5">
                  <div className="text-xs tracking-wider mb-1" style={{ color: '#b0a898' }}>疲労度</div>
                  <div className="flex items-baseline justify-center">
                    <span className="text-6xl font-light" style={{ fontFamily: '"JetBrains Mono", monospace', color: '#c8584c' }}>73</span>
                    <span className="text-lg ml-1" style={{ color: '#c8b8a8' }}>/100</span>
                  </div>
                </div>

                {/* Gradient bar */}
                <div className="w-full h-1.5 rounded-full mb-6" style={{ background: '#ede8e2' }}>
                  <div className="h-1.5 rounded-full" style={{ width: '73%', background: 'linear-gradient(90deg, #8bc8a0, #c8b84c, #c8584c)' }} />
                </div>

                {/* Sub metrics in glass pills */}
                <div className="flex gap-2 justify-center flex-wrap">
                  {[
                    { label: '推定睡眠', value: '1.8h', color: '#7b6ec8' },
                    { label: '眠気', value: '7.9/9', color: '#c8964c' },
                    { label: '目の下', value: '99%', color: '#6282e3' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-full px-4 py-2" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.3)' }}>
                      <div className="text-[9px] tracking-wider" style={{ color: '#b0a898' }}>{label}</div>
                      <div className="text-sm font-medium" style={{ fontFamily: 'monospace', color }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-4">
                  <span className="text-xs" style={{ color: '#c8584c' }}>休息を推奨します</span>
                </div>
              </div>
            </section>

            {/* Process - floating cards */}
            <section className="mb-8">
              <div className="text-xs tracking-wider mb-3 text-center" style={{ color: '#b0a898' }}>
                しくみ
              </div>
              <div className="flex gap-3 justify-center">
                {[
                  { icon: 'M4 8h24M4 8l4-4h12l4 4M8 8v16a2 2 0 002 2h8a2 2 0 002-2V8', title: '撮影', sub: '5秒' },
                  { icon: 'M16 4a12 12 0 100 24 12 12 0 000-24M12 16h8', title: '解析', sub: 'AI' },
                  { icon: 'M4 4h24v24H4zM8 20l6-8 4 5 6-7', title: '結果', sub: 'スコア' },
                ].map(({ icon, title, sub }) => (
                  <div key={title} className="flex-1 rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <svg viewBox="0 0 32 32" className="w-6 h-6 mx-auto mb-2" fill="none">
                      <path d={icon} stroke="#8b7ec8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="text-xs font-medium" style={{ color: '#4a4540' }}>{title}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: '#b0a898' }}>{sub}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Trust */}
            <footer className="text-center space-y-2 pb-8">
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.3)' }}>
                <svg viewBox="0 0 16 16" className="w-3 h-3" style={{ color: '#8b7ec8' }}>
                  <rect x="2" y="6" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M5 6V4a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
                <span className="text-[10px]" style={{ color: '#8a8078' }}>データはブラウザ内で処理</span>
              </div>
              <div className="text-[9px]" style={{ color: '#c8c0b8' }}>
                学術論文ベース / OSS
              </div>
            </footer>
          </>
        ) : (
          <FatigueReceipt result={result} onReset={() => setResult(null)} />
        )}
      </div>
    </main>
  );
}
