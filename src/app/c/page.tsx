'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-neutral-50" />,
});

/* ── C: Z世代ミニマル — 21歳ユニセックス、いつでも ──
   「何点？」以外の情報なし。究極ミニマル。
   結果は大きい数字1つだけ。それをスクショしてストーリーに載せる。
   白×1色アクセント。フォントが全て。余白が全て。 */

export default function PatternC() {
  const [result, setResult] = useState<FatigueResult | null>(null);

  const accent = result
    ? result.fatigueScore >= 60 ? '#e84040' : result.fatigueScore >= 35 ? '#e8a040' : '#40b878'
    : '#1a1a1a';

  return (
    <main className="h-[100dvh] flex flex-col overflow-hidden"
          style={{ background: '#fafafa', fontFamily: '"Noto Sans JP", sans-serif' }}>

      {!result ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          {/* Just the question */}
          <h1 className="text-3xl font-bold text-center mb-8" style={{ color: '#1a1a1a', letterSpacing: '-0.02em', lineHeight: '1.3' }}>
            今の
            <span style={{ color: '#888' }}>ねむみ</span>、
            <br />何点？
          </h1>

          {/* Camera - clean rectangle */}
          <div className="w-full max-w-[280px] aspect-[4/3] rounded-2xl overflow-hidden mb-6"
               style={{ border: '1px solid #e8e8e8' }}>
            <FatigueScanner onResult={setResult} />
          </div>

          <p className="text-[10px]" style={{ color: '#ccc', letterSpacing: '0.1em' }}>
            5秒 / ブラウザ内処理
          </p>
        </div>
      ) : (
        /* Result - ONE number. That's it. */
        <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
          {/* Background subtle color */}
          <div className="absolute inset-0" style={{ background: `${accent}05` }} />

          <div className="relative text-center">
            <p className="text-sm mb-4" style={{ color: '#aaa' }}>
              ねむみ
            </p>

            {/* THE number */}
            <div className="text-[140px] font-bold leading-none" style={{
              fontFamily: '"JetBrains Mono", monospace',
              color: accent,
              letterSpacing: '-0.05em',
            }}>
              {result.fatigueScore}
            </div>

            <p className="text-sm mt-4 mb-8" style={{ color: '#bbb' }}>
              {result.fatigueScore >= 60 ? 'もう寝よ。' :
               result.fatigueScore >= 35 ? 'ちょっと疲れてる。' :
               'まだいける。'}
            </p>

            <div className="flex gap-3 justify-center">
              <button onClick={() => setResult(null)}
                      className="px-5 py-2.5 rounded-full text-xs"
                      style={{ background: '#f0f0f0', color: '#888' }}>
                もう一回
              </button>
              <button onClick={() => {
                const t = `ねむみ ${result.fatigueScore}点`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(location.origin + '/c')}`, '_blank');
              }}
                      className="px-5 py-2.5 rounded-full text-xs font-medium text-white"
                      style={{ background: accent }}>
                シェア
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
