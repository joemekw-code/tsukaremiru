'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});
const FatigueReceipt = dynamic(() => import('@/components/FatigueReceipt'), { ssr: false });

/* ── Pattern A: ねむみ — ゆるい友達トーン ──
   Persona: 23歳、夜11時、残業帰り。「やば笑」ってシェアしたい。
   Emotion: 心配してくれる友達。深刻じゃない。軽い。
   Visual: 温かみのあるベージュ、丸ゴシック、やわらかいマスコット */

function Nemumi({ level }: { level: 'default' | 'scanning' | 'low' | 'mid' | 'high' }) {
  return (
    <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
      {/* Soft round body */}
      <ellipse cx="40" cy="42" rx="30" ry="28" fill="#f0e8dc"/>
      <ellipse cx="40" cy="42" rx="30" ry="28" stroke="#ddd0be" strokeWidth="1"/>
      {/* Cheeks */}
      <circle cx="24" cy="48" r="5" fill="#f0ccc4" opacity="0.4"/>
      <circle cx="56" cy="48" r="5" fill="#f0ccc4" opacity="0.4"/>

      {level === 'default' && <>
        <path d="M30 40 Q34 43 38 40" stroke="#8a7b6a" strokeWidth="2" strokeLinecap="round"/>
        <path d="M42 40 Q46 43 50 40" stroke="#8a7b6a" strokeWidth="2" strokeLinecap="round"/>
        <path d="M35 52 Q40 55 45 52" stroke="#8a7b6a" strokeWidth="1.5" strokeLinecap="round"/>
      </>}
      {level === 'scanning' && <>
        <circle cx="34" cy="39" r="2.5" fill="#8a7b6a"/>
        <circle cx="46" cy="39" r="2.5" fill="#8a7b6a"/>
        <ellipse cx="40" cy="53" rx="3" ry="2" fill="#8a7b6a" opacity="0.3"/>
      </>}
      {level === 'high' && <>
        <path d="M29 42 Q34 38 39 42" stroke="#8a7b6a" strokeWidth="2" strokeLinecap="round"/>
        <path d="M41 42 Q46 38 51 42" stroke="#8a7b6a" strokeWidth="2" strokeLinecap="round"/>
        <path d="M36 54 Q40 51 44 54" stroke="#8a7b6a" strokeWidth="1.5" strokeLinecap="round"/>
        <text x="55" y="30" fontSize="10" fill="#c4aa8a" fontWeight="600" fontFamily="sans-serif">z</text>
        <text x="60" y="23" fontSize="8" fill="#d4c4aa" fontWeight="600" fontFamily="sans-serif">z</text>
      </>}
      {level === 'mid' && <>
        <path d="M30 40 Q34 42 38 40" stroke="#8a7b6a" strokeWidth="2" strokeLinecap="round"/>
        <path d="M42 40 Q46 42 50 40" stroke="#8a7b6a" strokeWidth="2" strokeLinecap="round"/>
        <path d="M36 53 Q40 50 44 53" stroke="#8a7b6a" strokeWidth="1.5" strokeLinecap="round"/>
      </>}
      {level === 'low' && <>
        <path d="M30 38 Q34 34 38 38" stroke="#8a7b6a" strokeWidth="2" strokeLinecap="round"/>
        <path d="M42 38 Q46 34 50 38" stroke="#8a7b6a" strokeWidth="2" strokeLinecap="round"/>
        <path d="M34 52 Q40 57 46 52" stroke="#8a7b6a" strokeWidth="1.5" strokeLinecap="round"/>
      </>}
    </svg>
  );
}

export default function PatternA() {
  const [result, setResult] = useState<FatigueResult | null>(null);
  const [scanning, setScanning] = useState(false);

  const level = !result ? (scanning ? 'scanning' : 'default')
    : result.fatigueScore >= 60 ? 'high'
    : result.fatigueScore >= 35 ? 'mid' : 'low';

  return (
    <main className="h-[100dvh] flex flex-col overflow-hidden"
          style={{ background: '#faf5ee', fontFamily: '"M PLUS Rounded 1c", sans-serif' }}>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Mascot always visible */}
        <Nemumi level={level as 'default'} />

        {!result ? (
          <>
            <h1 className="text-lg font-bold mt-3 mb-0.5" style={{ color: '#5a4e42', letterSpacing: '0.08em' }}>
              ねむみ
            </h1>
            <p className="text-xs mb-5" style={{ color: '#b0a090', lineHeight: '1.7' }}>
              顔を5秒見せてね。疲れ具合、測るよ。
            </p>

            {/* Camera */}
            <div className="w-full max-w-[260px] aspect-[4/3] rounded-2xl overflow-hidden mb-4"
                 style={{ border: '1.5px solid #e8ddd0' }}>
              <FatigueScanner onResult={(r) => { setScanning(false); setResult(r); }} />
            </div>

            <p className="text-[9px]" style={{ color: '#d0c4b4', letterSpacing: '0.08em' }}>
              映像は外に出ません
            </p>
          </>
        ) : (
          <>
            {/* Result - friendly tone */}
            <div className="text-center mt-2">
              <p className="text-xs mb-2" style={{ color: '#b0a090' }}>
                {result.fatigueScore >= 60 ? 'ちょっと疲れすぎかも...' : result.fatigueScore >= 35 ? 'そこそこお疲れだね' : '元気じゃん！'}
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold" style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  color: result.fatigueScore >= 60 ? '#c4645a' : result.fatigueScore >= 35 ? '#c4a05a' : '#6aaa78'
                }}>
                  {result.fatigueScore}
                </span>
                <span className="text-sm" style={{ color: '#c4baa8' }}>点</span>
              </div>
              <p className="text-xs mt-3 mb-5 px-4" style={{ color: '#a09484', lineHeight: '1.7' }}>
                {result.fatigueScore >= 60 ? 'スマホ置いて寝よ？明日の自分が喜ぶよ。' :
                 result.fatigueScore >= 35 ? 'あと少し頑張れるけど、無理しないでね。' :
                 'この調子！でも夜更かしはほどほどにね。'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setResult(null)}
                        className="text-xs px-5 py-2.5 rounded-full font-medium"
                        style={{ background: '#ece2d4', color: '#6a5a48' }}>
                  もう一回
                </button>
                <button onClick={() => {
                  const text = `ねむみチェックしたら${result.fatigueScore}点だった`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin + '/a')}`, '_blank');
                }}
                        className="text-xs px-5 py-2.5 rounded-full font-medium"
                        style={{ background: '#5a4e42', color: '#faf5ee' }}>
                  共有する
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
