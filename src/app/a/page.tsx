'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[4/3] bg-stone-100 rounded-xl flex items-center justify-center border border-stone-200">
      <div className="text-stone-400 text-sm tracking-widest">準備中</div>
    </div>
  ),
});

const FatigueReceipt = dynamic(() => import('@/components/FatigueReceipt'), { ssr: false });

export default function PatternA() {
  const [result, setResult] = useState<FatigueResult | null>(null);

  return (
    <main className="min-h-screen" style={{ background: '#f8f6f0', fontFamily: '"Noto Serif JP", "Hiragino Mincho ProN", serif' }}>
      {/* Subtle texture overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />

      <div className="relative max-w-md mx-auto px-5 py-12">
        {!result ? (
          <>
            {/* Header - vertical Japanese aesthetic */}
            <header className="text-center mb-10">
              <div className="inline-block border-b-2 border-stone-800 pb-2 mb-4">
                <h1 className="text-2xl tracking-[0.3em] text-stone-800 font-normal">
                  つかれみる
                </h1>
              </div>
              <p className="text-stone-500 text-sm tracking-wide leading-relaxed">
                顔は、嘘をつかない。<br />
                五秒の静寂が、あなたの疲れを数字にする。
              </p>
            </header>

            {/* Scanner area */}
            <FatigueScanner onResult={setResult} />

            {/* Divider */}
            <div className="flex items-center gap-4 my-10">
              <div className="flex-1 h-px bg-stone-300" />
              <div className="w-1.5 h-1.5 bg-stone-400 rotate-45" />
              <div className="flex-1 h-px bg-stone-300" />
            </div>

            {/* Sample reading */}
            <section className="mb-10">
              <div className="text-xs text-stone-400 tracking-[0.2em] mb-4 text-center">測 定 例</div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-stone-200/60">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-stone-500 text-sm">疲労度</span>
                  <div>
                    <span className="text-4xl font-light text-stone-800" style={{ fontFamily: '"JetBrains Mono", monospace' }}>73</span>
                    <span className="text-stone-400 text-sm ml-1">/100</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-stone-200 rounded-full mb-6">
                  <div className="h-1 rounded-full" style={{ width: '73%', background: 'linear-gradient(90deg, #c53d43, #8b2329)' }} />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-[10px] text-stone-400 tracking-wider">推定睡眠</div>
                    <div className="text-lg text-stone-700 mt-1" style={{ fontFamily: 'monospace' }}>1.8<span className="text-xs text-stone-400">h</span></div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 tracking-wider">眠気度</div>
                    <div className="text-lg text-stone-700 mt-1" style={{ fontFamily: 'monospace' }}>7.9<span className="text-xs text-stone-400">/9</span></div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400 tracking-wider">目の下</div>
                    <div className="text-lg text-stone-700 mt-1" style={{ fontFamily: 'monospace' }}>99<span className="text-xs text-stone-400">%</span></div>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <span className="text-xs px-3 py-1 rounded-full" style={{ color: '#c53d43', background: '#c53d4310' }}>
                    休息を推奨
                  </span>
                </div>
              </div>
            </section>

            {/* How it works - minimal */}
            <section className="mb-10">
              <div className="text-xs text-stone-400 tracking-[0.2em] mb-4 text-center">仕 組 み</div>
              <div className="space-y-3">
                {[
                  { n: '一', title: '撮影', desc: 'カメラに五秒間向けます' },
                  { n: '二', title: '解析', desc: '八つの生体信号をAIが読み取ります' },
                  { n: '三', title: '結果', desc: '疲労度と具体的なアドバイスをお渡しします' },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 text-sm shrink-0 mt-0.5">
                      {n}
                    </div>
                    <div>
                      <div className="text-stone-700 text-sm font-medium">{title}</div>
                      <div className="text-stone-400 text-xs mt-0.5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Trust */}
            <footer className="text-center space-y-2 pb-8">
              <div className="text-[10px] text-stone-400 tracking-wider">
                映像はサーバーに送信されません
              </div>
              <div className="text-[9px] text-stone-300">
                Dinges 1998 / Caffier 2003 / Borbely 1982
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
