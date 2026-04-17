'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => <div className="absolute inset-0" style={{ background: '#12061e' }} />,
});

/* ── A: TikTok診断 — 20歳女性、深夜1時、ベッドでスマホ ──
   「ねむみ度診断やってみたw」→ 結果スクショしてストーリーに載せる
   紫グラデ、キラキラ、丸い、診断結果カード風
   動機: 友達もやってる。何点だったか比べたい。 */

export default function PatternA() {
  const [result, setResult] = useState<FatigueResult | null>(null);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    if (result) {
      const t = setTimeout(() => setReveal(true), 300);
      return () => clearTimeout(t);
    }
    setReveal(false);
  }, [result]);

  const getType = (s: number) =>
    s >= 75 ? { name: '限界タイプ', desc: '今すぐスマホ置いて。まじで。', bg: '#3a0a1a', accent: '#ff4466' } :
    s >= 55 ? { name: 'がんばりすぎタイプ', desc: 'えらいけど、そろそろ限界近いよ。', bg: '#2a0a2e', accent: '#cc66ff' } :
    s >= 35 ? { name: 'ちょい疲れタイプ', desc: 'まだいけるけど、無理しないでね。', bg: '#1a0a2e', accent: '#8866ff' } :
    { name: '元気タイプ', desc: 'すごい！このまま明日もがんばれ！', bg: '#0a1a2e', accent: '#66aaff' };

  return (
    <main className="h-[100dvh] relative overflow-hidden"
          style={{ fontFamily: '"M PLUS Rounded 1c", sans-serif' }}>

      {!result ? (
        <>
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(170deg, #0a0618 0%, #1a0a30 30%, #2a0e48 60%, #180828 100%)'
          }} />

          {/* Sparkles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute w-1 h-1 rounded-full bg-white/20"
                   style={{ left: `${15 + i * 15}%`, top: `${10 + (i % 3) * 25}%`, animation: `float ${2 + i * 0.3}s ease-in-out infinite` }} />
            ))}
          </div>

          <div className="relative z-10 h-full flex flex-col items-center pt-16 px-6">
            <div className="text-white/20 text-[9px] tracking-[0.4em] mb-3">NEMUMI DIAGNOSIS</div>
            <h1 className="text-2xl font-bold text-white text-center mb-1">
              あなたの<br /><span style={{ color: '#cc88ff' }}>ねむみ度</span>、診断します
            </h1>
            <p className="text-white/30 text-xs mb-6">カメラに5秒顔を向けてね</p>

            {/* Camera - rounded */}
            <div className="w-56 h-44 rounded-3xl overflow-hidden mb-4"
                 style={{ border: '2px solid #ffffff10', boxShadow: '0 0 40px #cc88ff15' }}>
              <FatigueScanner onResult={setResult} />
            </div>

            <p className="text-white/15 text-[9px] mt-auto mb-8 tracking-wider">
              映像はどこにも保存されません
            </p>
          </div>
        </>
      ) : (
        /* Diagnosis result - card style for screenshot */
        <div className="h-full flex flex-col items-center justify-center px-6" style={{
          background: `linear-gradient(170deg, ${getType(result.fatigueScore).bg}, #0a0618)`
        }}>
          <div className={`w-full max-w-[320px] rounded-3xl p-6 text-center transition-all duration-700 ${reveal ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
               style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>

            <div className="text-[10px] tracking-[0.3em] mb-2" style={{ color: getType(result.fatigueScore).accent }}>
              DIAGNOSIS RESULT
            </div>

            <div className="text-6xl font-bold text-white mb-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              {result.fatigueScore}
            </div>
            <div className="text-white/20 text-xs mb-4">ねむみスコア</div>

            {/* Type badge */}
            <div className="inline-block px-4 py-1.5 rounded-full mb-4 text-sm font-bold"
                 style={{ background: `${getType(result.fatigueScore).accent}20`, color: getType(result.fatigueScore).accent }}>
              {getType(result.fatigueScore).name}
            </div>

            <p className="text-white/40 text-xs mb-5" style={{ lineHeight: '1.8' }}>
              {getType(result.fatigueScore).desc}
            </p>

            {/* Mini stats */}
            <div className="flex justify-center gap-4 mb-5">
              {[
                { l: '睡眠', v: `${result.estimatedSleepHours}h` },
                { l: '眠気', v: `${result.kss}/9` },
                { l: 'クマ', v: `${Math.round(result.components['Dark Circles'] * 100)}%` },
              ].map(({ l, v }) => (
                <div key={l} className="text-center">
                  <div className="text-white/15 text-[8px] tracking-wider">{l}</div>
                  <div className="text-white/60 text-sm" style={{ fontFamily: 'monospace' }}>{v}</div>
                </div>
              ))}
            </div>

            <div className="text-white/10 text-[8px] tracking-wider">nemumi.app</div>
          </div>

          {/* Actions below card */}
          <div className="flex gap-3 mt-6">
            <button onClick={() => setResult(null)}
                    className="px-5 py-2.5 rounded-full text-xs text-white/30"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
              もう一回
            </button>
            <button onClick={() => {
              const type = getType(result.fatigueScore).name;
              const t = `ねむみ診断したら${result.fatigueScore}点の「${type}」だった`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(location.origin + '/a')}`, '_blank');
            }}
                    className="px-5 py-2.5 rounded-full text-xs font-bold"
                    style={{ background: getType(result.fatigueScore).accent, color: '#0a0618' }}>
              結果をシェア
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
