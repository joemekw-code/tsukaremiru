'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

/* ── A: LINEスタンプ女子 ──
   21歳女子大生。チャットバブルUI。マスコットが話しかける。
   ピンク×ミント×クリーム。丸い。やわらかい。 */

function Nemu({ mood }: { mood: string }) {
  return (
    <svg viewBox="0 0 64 64" className="w-10 h-10 shrink-0" fill="none">
      <circle cx="32" cy="34" r="22" fill="#ffe8e8"/>
      <circle cx="32" cy="34" r="22" stroke="#ffc8c8" strokeWidth="1"/>
      <circle cx="22" cy="38" r="3.5" fill="#ffcccc" opacity="0.3"/>
      <circle cx="42" cy="38" r="3.5" fill="#ffcccc" opacity="0.3"/>
      {mood === 'talk' && <>
        <circle cx="26" cy="32" r="2" fill="#8a6060"/>
        <circle cx="38" cy="32" r="2" fill="#8a6060"/>
        <path d="M28 40 Q32 43 36 40" stroke="#8a6060" strokeWidth="1.5" strokeLinecap="round"/>
      </>}
      {mood === 'tired' && <>
        <path d="M23 33 Q27 36 31 33" stroke="#8a6060" strokeWidth="2" strokeLinecap="round"/>
        <path d="M33 33 Q37 36 41 33" stroke="#8a6060" strokeWidth="2" strokeLinecap="round"/>
        <path d="M29 41 Q32 39 35 41" stroke="#8a6060" strokeWidth="1.5" strokeLinecap="round"/>
        <text x="44" y="24" fontSize="8" fill="#cca0a0" fontWeight="600">z</text>
        <text x="48" y="19" fontSize="6" fill="#ddb8b8" fontWeight="600">z</text>
      </>}
      {mood === 'happy' && <>
        <path d="M24 31 Q27 28 30 31" stroke="#8a6060" strokeWidth="2" strokeLinecap="round"/>
        <path d="M34 31 Q37 28 40 31" stroke="#8a6060" strokeWidth="2" strokeLinecap="round"/>
        <path d="M27 40 Q32 45 37 40" stroke="#8a6060" strokeWidth="1.5" strokeLinecap="round"/>
      </>}
    </svg>
  );
}

function Bubble({ children, from }: { children: React.ReactNode; from: 'nemu' | 'user' }) {
  return (
    <div className={`flex gap-2 items-end ${from === 'user' ? 'flex-row-reverse' : ''}`}
         style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
      {from === 'nemu' && <Nemu mood="talk" />}
      <div className={`max-w-[70%] px-4 py-2.5 text-sm leading-relaxed ${
        from === 'nemu'
          ? 'rounded-2xl rounded-bl-sm bg-white text-gray-700 border border-pink-100'
          : 'rounded-2xl rounded-br-sm bg-pink-400 text-white'
      }`}>
        {children}
      </div>
    </div>
  );
}

export default function PatternA() {
  const [result, setResult] = useState<FatigueResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  return (
    <main className="h-[100dvh] flex flex-col overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #fff5f5 0%, #fdf0f0 50%, #f5e8e8 100%)', fontFamily: '"M PLUS Rounded 1c", sans-serif' }}>

      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-3" style={{ borderBottom: '1px solid #f0dada' }}>
        <Nemu mood="talk" />
        <div>
          <div className="text-sm font-bold" style={{ color: '#6a4a4a' }}>ねむみ</div>
          <div className="text-[10px]" style={{ color: '#c8a0a0' }}>疲れ度チェック</div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {!result ? (
          <>
            <Bubble from="nemu">
              おつかれ〜！今日もがんばったね。
            </Bubble>
            <Bubble from="nemu">
              顔見せてくれたら、どのくらい疲れてるか教えるよ。5秒だけね。
            </Bubble>

            {!showCamera ? (
              <div className="flex justify-end">
                <button onClick={() => setShowCamera(true)}
                        className="px-5 py-2.5 rounded-full text-sm font-medium text-white"
                        style={{ background: '#e88a8a' }}>
                  見せる！
                </button>
              </div>
            ) : (
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border" style={{ borderColor: '#f0dada' }}>
                <FatigueScanner onResult={setResult} />
              </div>
            )}
          </>
        ) : (
          <>
            <Bubble from="nemu">
              見せてくれてありがと！結果出たよ〜
            </Bubble>

            {/* Result card */}
            <div className="bg-white rounded-2xl p-5 border border-pink-100 mx-2"
                 style={{ animation: 'fadeSlideUp 0.4s ease-out' }}>
              <div className="flex items-center justify-between mb-3">
                <Nemu mood={result.fatigueScore >= 50 ? 'tired' : 'happy'} />
                <div className="text-right">
                  <div className="text-[10px]" style={{ color: '#c8a0a0' }}>疲れ度</div>
                  <span className="text-4xl font-bold" style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    color: result.fatigueScore >= 60 ? '#d06060' : result.fatigueScore >= 35 ? '#d0a050' : '#60b080'
                  }}>{result.fatigueScore}</span>
                  <span className="text-sm" style={{ color: '#d0c0c0' }}>/100</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full mb-3" style={{ background: '#f8e8e8' }}>
                <div className="h-full rounded-full" style={{
                  width: `${result.fatigueScore}%`,
                  background: result.fatigueScore >= 60 ? '#e07070' : result.fatigueScore >= 35 ? '#e0b060' : '#70c090'
                }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl py-1.5" style={{ background: '#fdf5f5' }}>
                  <div style={{ color: '#c8a0a0' }}>睡眠</div>
                  <div className="font-bold" style={{ color: '#6a4a4a' }}>{result.estimatedSleepHours}h</div>
                </div>
                <div className="rounded-xl py-1.5" style={{ background: '#fdf5f5' }}>
                  <div style={{ color: '#c8a0a0' }}>眠気</div>
                  <div className="font-bold" style={{ color: '#6a4a4a' }}>{result.kss}/9</div>
                </div>
                <div className="rounded-xl py-1.5" style={{ background: '#fdf5f5' }}>
                  <div style={{ color: '#c8a0a0' }}>目の下</div>
                  <div className="font-bold" style={{ color: '#6a4a4a' }}>{Math.round(result.components['Dark Circles'] * 100)}%</div>
                </div>
              </div>
            </div>

            <Bubble from="nemu">
              {result.fatigueScore >= 60 ? 'だいぶ疲れてるよ〜！もうスマホ置いて寝よ？' :
               result.fatigueScore >= 35 ? 'ちょっと疲れ気味かな。無理しないでね。' :
               '全然元気じゃん！でも夜更かしはほどほどにね〜'}
            </Bubble>

            <div className="flex justify-end gap-2">
              <button onClick={() => { setResult(null); setShowCamera(false); }}
                      className="px-4 py-2 rounded-full text-xs"
                      style={{ background: '#f8e8e8', color: '#8a6a6a' }}>
                もう一回
              </button>
              <button onClick={() => {
                const t = `ねむみチェック${result.fatigueScore}点だった💤`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(location.origin + '/a')}`, '_blank');
              }}
                      className="px-4 py-2 rounded-full text-xs text-white"
                      style={{ background: '#e88a8a' }}>
                結果をシェア
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
