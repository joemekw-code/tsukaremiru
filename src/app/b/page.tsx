'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => <div className="absolute inset-0" style={{ background: '#1a0a2e' }} />,
});

/* ── B: TikTok診断 ──
   19歳。診断系大好き。ビビッド。一画面に一情報をドカン。
   紫×ネオンピンク。グラデーション。大文字。 */

export default function PatternB() {
  const [result, setResult] = useState<FatigueResult | null>(null);

  return (
    <main className="h-[100dvh] relative overflow-hidden"
          style={{ fontFamily: '"M PLUS Rounded 1c", sans-serif' }}>

      {!result ? (
        <>
          {/* Background gradient */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(160deg, #1a0a2e 0%, #2d1458 40%, #4a1a6b 70%, #1a0a2e 100%)'
          }} />

          {/* Decorative blobs */}
          <div className="absolute top-20 -right-20 w-60 h-60 rounded-full opacity-20"
               style={{ background: 'radial-gradient(circle, #ff6b9d, transparent)' }} />
          <div className="absolute bottom-40 -left-10 w-40 h-40 rounded-full opacity-15"
               style={{ background: 'radial-gradient(circle, #6b6bff, transparent)' }} />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-between px-6 pt-16 pb-10">
            {/* Top */}
            <div className="text-center">
              <div className="text-white/30 text-[10px] tracking-[0.3em] mb-2">FATIGUE DIAGNOSIS</div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
                あなたの<br />
                <span style={{ color: '#ff6b9d' }}>ねむみ度</span>は？
              </h1>
              <p className="text-white/40 text-xs">カメラで5秒。AIが診断します。</p>
            </div>

            {/* Camera - circular */}
            <div className="w-52 h-52 rounded-full overflow-hidden border-4"
                 style={{ borderColor: '#ff6b9d40' }}>
              <FatigueScanner onResult={setResult} />
            </div>

            {/* Bottom */}
            <div className="text-center">
              <p className="text-white/20 text-[9px] tracking-wider">
                映像はどこにも保存されません
              </p>
            </div>
          </div>
        </>
      ) : (
        /* Result - full screen dramatic reveal */
        <div className="h-full flex flex-col items-center justify-center px-6 relative" style={{
          background: result.fatigueScore >= 60
            ? 'linear-gradient(160deg, #2e0a0a, #4a1a1a, #2e0a0a)'
            : result.fatigueScore >= 35
            ? 'linear-gradient(160deg, #2e1a0a, #4a3a1a, #2e1a0a)'
            : 'linear-gradient(160deg, #0a2e1a, #1a4a2a, #0a2e1a)'
        }}>
          {/* Diagnosis label */}
          <div className="px-4 py-1.5 rounded-full mb-4 text-[10px] tracking-[0.2em]" style={{
            background: result.fatigueScore >= 60 ? '#ff6b6b20' : result.fatigueScore >= 35 ? '#ffaa6b20' : '#6bff9d20',
            color: result.fatigueScore >= 60 ? '#ff8888' : result.fatigueScore >= 35 ? '#ffcc88' : '#88ffaa'
          }}>
            {result.fatigueScore >= 60 ? '要注意レベル' : result.fatigueScore >= 35 ? 'ちょい疲れ' : '元気'}
          </div>

          {/* Giant score */}
          <div className="text-[120px] font-bold text-white leading-none mb-2"
               style={{ fontFamily: '"JetBrains Mono", monospace', textShadow: '0 0 40px rgba(255,255,255,0.1)' }}>
            {result.fatigueScore}
          </div>
          <div className="text-white/20 text-xs tracking-[0.3em] mb-6">NEMUMI SCORE</div>

          {/* Stats row */}
          <div className="flex gap-6 mb-8">
            {[
              { label: '睡眠', value: `${result.estimatedSleepHours}h` },
              { label: '眠気', value: `${result.kss}/9` },
              { label: 'クマ', value: `${Math.round(result.components['Dark Circles'] * 100)}%` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-white/20 text-[9px] tracking-wider">{label}</div>
                <div className="text-white/70 text-base font-medium" style={{ fontFamily: 'monospace' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Message */}
          <p className="text-white/30 text-xs text-center mb-6 max-w-[260px]" style={{ lineHeight: '1.8' }}>
            {result.fatigueScore >= 60 ? 'かなり疲れてるね。今日はもう寝た方がいいよ。' :
             result.fatigueScore >= 35 ? 'ちょっと疲れ気味。もう少ししたら休もう。' :
             'まだまだ元気！でもほどほどにね。'}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => setResult(null)}
                    className="px-5 py-2.5 rounded-full text-xs text-white/40"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
              もう一回
            </button>
            <button onClick={() => {
              const t = `ねむみ診断 ${result.fatigueScore}点 — ${result.fatigueScore >= 60 ? '限界' : result.fatigueScore >= 35 ? 'ちょい疲れ' : '元気'}`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(location.origin + '/b')}`, '_blank');
            }}
                    className="px-5 py-2.5 rounded-full text-xs font-bold"
                    style={{ background: '#ff6b9d', color: '#1a0a2e' }}>
              診断結果をシェア
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
