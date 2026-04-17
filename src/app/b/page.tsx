'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black" />,
});

/* ── Pattern B: ねむみ — ストリート/Y2K ──
   Persona: 同じ23歳だけど、もっとエッジーな方。
   Emotion: 自虐ネタとして使う。「もう限界w」
   Visual: ダーク、ネオンアクセント、太い文字、パンクな感じ */

export default function PatternB() {
  const [result, setResult] = useState<FatigueResult | null>(null);

  return (
    <main className="h-[100dvh] relative overflow-hidden bg-black"
          style={{ fontFamily: '"M PLUS Rounded 1c", sans-serif' }}>

      {!result ? (
        <>
          {/* Camera fills everything */}
          <div className="absolute inset-0">
            <FatigueScanner onResult={setResult} />
          </div>

          {/* Top overlay */}
          <div className="absolute top-0 left-0 right-0 z-10 pt-14 px-5"
               style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
            <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
              ねむみ
            </h1>
            <p className="text-white/30 text-[10px] tracking-widest mt-0.5">
              NEMUMI — FATIGUE CHECK
            </p>
          </div>

          {/* Bottom overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10 pb-10 px-5"
               style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
            <p className="text-white/40 text-xs text-center">
              5秒見せて。疲れ度、出すから。
            </p>
            <div className="flex justify-center mt-3 gap-4 text-[9px] text-white/20">
              <span>ブラウザ内処理</span>
              <span>データ送信なし</span>
            </div>
          </div>
        </>
      ) : (
        /* Result - bold, punchy */
        <div className="h-full flex flex-col items-center justify-center px-6 bg-black">
          <p className="text-white/30 text-xs tracking-widest mb-2">
            {result.fatigueScore >= 60 ? '限界じゃん' : result.fatigueScore >= 35 ? 'まあまあ疲れてる' : 'まだいける'}
          </p>
          <div className="text-8xl font-bold text-white mb-1" style={{ fontFamily: '"JetBrains Mono", monospace', letterSpacing: '-0.05em' }}>
            {result.fatigueScore}
          </div>
          <div className="w-32 h-1 rounded-full my-4" style={{ background: '#1a1a1a' }}>
            <div className="h-1 rounded-full" style={{
              width: `${result.fatigueScore}%`,
              background: result.fatigueScore >= 60 ? '#ff6b6b' : result.fatigueScore >= 35 ? '#ffc078' : '#69db7c'
            }} />
          </div>

          <p className="text-white/25 text-xs text-center mb-8 max-w-[240px]" style={{ lineHeight: '1.7' }}>
            {result.fatigueScore >= 60 ? 'もう寝な。明日の自分に謝ることになるよ。' :
             result.fatigueScore >= 35 ? 'ギリいけるけど、そろそろ限界近いよ。' :
             '全然余裕じゃん。好きにしな。'}
          </p>

          <div className="flex gap-3">
            <button onClick={() => setResult(null)}
                    className="text-xs px-5 py-2.5 rounded-full text-white/50"
                    style={{ background: '#1a1a1a' }}>
              もう一回
            </button>
            <button onClick={() => {
              const text = `ねむみ${result.fatigueScore}点で${result.fatigueScore >= 60 ? '限界' : result.fatigueScore >= 35 ? 'そこそこ' : '余裕'}だった`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin + '/b')}`, '_blank');
            }}
                    className="text-xs px-5 py-2.5 rounded-full font-medium"
                    style={{ background: '#ff6b6b', color: '#000' }}>
              晒す
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
