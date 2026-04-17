'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-md aspect-[4/3] bg-indigo-50 rounded-3xl flex items-center justify-center border-2 border-indigo-100">
        <div className="text-center">
          <div className="text-5xl mb-3" style={{ animation: 'float 3s ease-in-out infinite' }}>😴</div>
          <div className="text-indigo-400 text-sm">準備中...</div>
        </div>
      </div>
    </div>
  ),
});

const FatigueReceipt = dynamic(() => import('@/components/FatigueReceipt'), {
  ssr: false,
});

export default function Home() {
  const [result, setResult] = useState<FatigueResult | null>(null);

  return (
    <main className="min-h-screen bg-[#faf9f7] text-gray-900">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2" style={{ animation: 'float 3s ease-in-out infinite' }}>
            😮‍💨
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            つかれみる
          </h1>
          <p className="text-gray-500 text-base">
            カメラに5秒向けるだけ。あなたの疲れ、数字にします。
          </p>
        </div>

        {!result ? (
          <>
            {/* Scanner */}
            <FatigueScanner onResult={setResult} />

            {/* Fun use cases */}
            <div className="mt-8 space-y-3">
              <div className="text-center text-sm text-gray-400 font-medium">
                こんな時に使ってみて
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { emoji: '💻', text: 'デプロイ前の\n判断力チェック' },
                  { emoji: '📱', text: '推しの配信見て\n寝落ちする前に' },
                  { emoji: '🎮', text: '徹夜ランク戦\nまだいける？' },
                  { emoji: '☕', text: 'コーヒー3杯目\nそろそろやばい？' },
                ].map(({ emoji, text }) => (
                  <div key={text} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs text-gray-600 whitespace-pre-line leading-tight">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample result */}
            <div className="mt-8">
              <div className="text-center text-sm text-gray-400 font-medium mb-3">
                こんな結果が出るよ
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">😵</span>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">疲労度</div>
                    <div className="text-3xl font-bold text-red-400 font-mono">73<span className="text-base text-gray-300">/100</span></div>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 h-2 rounded-full" style={{ width: '73%' }} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-xl p-2">
                    <div className="text-xs text-gray-400">推定睡眠</div>
                    <div className="font-bold text-gray-700 font-mono">1.8h</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2">
                    <div className="text-xs text-gray-400">眠気</div>
                    <div className="font-bold text-orange-400 font-mono">7.9/9</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2">
                    <div className="text-xs text-gray-400">クマ度</div>
                    <div className="font-bold text-purple-400 font-mono">99%</div>
                  </div>
                </div>
                <div className="mt-3 text-center text-xs text-red-400 font-medium">
                  → 今すぐ寝てください 🛏️
                </div>
                <div className="mt-2 text-center text-[10px] text-gray-300">
                  ↑ 徹夜した開発者の実測値
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="mt-8">
              <div className="text-center text-sm text-gray-400 font-medium mb-3">
                しくみ
              </div>
              <div className="flex justify-center gap-3">
                {[
                  { emoji: '📷', text: 'カメラで\n5秒' },
                  { emoji: '🧠', text: 'AIが\n解析' },
                  { emoji: '📊', text: '結果\nGET' },
                ].map(({ emoji, text }, i) => (
                  <div key={text} className="flex flex-col items-center gap-1">
                    <div className="w-16 h-16 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center text-2xl">
                      {emoji}
                    </div>
                    <div className="text-[10px] text-gray-400 text-center whitespace-pre-line">{text}</div>
                    {i < 2 && <div className="absolute" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Trust */}
            <div className="mt-8 text-center space-y-2 pb-8">
              <div className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-xs px-3 py-1 rounded-full">
                <span>🔒</span> データはブラウザ内で処理。サーバーに送信しません
              </div>
              <div className="text-[10px] text-gray-300">
                学術論文ベース (Dinges 1998, Caffier 2003, Borbely 1982)
              </div>
            </div>
          </>
        ) : (
          <FatigueReceipt result={result} onReset={() => setResult(null)} />
        )}
      </div>
    </main>
  );
}
