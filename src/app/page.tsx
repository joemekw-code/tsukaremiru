'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-md mx-auto aspect-[4/3] bg-gray-900 rounded-2xl flex items-center justify-center">
      <div className="text-gray-400 text-sm animate-pulse">
        AIモデル読み込み中（初回のみ数秒）...
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
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            つかれみる
          </h1>
          <p className="text-gray-400 text-base mb-1">
            顔は嘘をつかない。5秒で疲労を数値化。
          </p>
          <p className="text-gray-600 text-xs">
            Oura Ringと同じことを、カメラだけで。無料。
          </p>
        </div>

        {!result ? (
          <>
            {/* Scanner */}
            <FatigueScanner onResult={setResult} />

            {/* Social proof / hook */}
            <div className="mt-8 bg-gray-900/80 border border-gray-800 rounded-xl p-4">
              <div className="text-sm text-gray-300 mb-2 font-medium">
                こんな人に使われています
              </div>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex gap-2">
                  <span className="shrink-0">💻</span>
                  <span>「深夜のデプロイ前に、自分がまともな判断力あるか確認したい」</span>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0">🏢</span>
                  <span>「上司に"疲れてます"と言う代わりに、数字を見せたい」</span>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0">🎮</span>
                  <span>「徹夜でランク戦やってたけど、本当にまだ続けていいのか」</span>
                </div>
              </div>
            </div>

            {/* What you get */}
            <div className="mt-6 space-y-4">
              <h2 className="text-sm font-medium text-gray-300">
                5秒でわかること
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
                  <div className="text-emerald-400 text-lg font-bold font-mono">73/100</div>
                  <div className="text-gray-500 text-xs mt-1">疲労度スコア</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
                  <div className="text-orange-400 text-lg font-bold font-mono">1.8h</div>
                  <div className="text-gray-500 text-xs mt-1">推定睡眠時間</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
                  <div className="text-red-400 text-lg font-bold font-mono">7.9/9</div>
                  <div className="text-gray-500 text-xs mt-1">KSS 眠気スケール</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
                  <div className="text-yellow-400 text-lg font-bold font-mono">84%</div>
                  <div className="text-gray-500 text-xs mt-1">クマ検出度</div>
                </div>
              </div>
              <p className="text-gray-600 text-xs text-center">
                ↑ 睡眠0時間の開発者の実測値
              </p>
            </div>

            {/* How it works */}
            <div className="mt-8">
              <h2 className="text-sm font-medium text-gray-300 mb-3">仕組み</h2>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <div>
                    <div className="text-sm text-gray-300">カメラで5秒スキャン</div>
                    <div className="text-xs text-gray-600">映像はサーバーに送信されません</div>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <div>
                    <div className="text-sm text-gray-300">8つの生体信号をAI解析</div>
                    <div className="text-xs text-gray-600">PERCLOS、瞬き持続時間、クマ色差、サーカディアンモデル等</div>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <div>
                    <div className="text-sm text-gray-300">疲労レシートを受け取る</div>
                    <div className="text-xs text-gray-600">スコア、推定睡眠、判定、具体的な行動アドバイス</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust */}
            <div className="mt-8 text-center space-y-2">
              <div className="text-xs text-gray-500">
                学術論文ベースのアルゴリズム
              </div>
              <div className="flex justify-center gap-4 text-xs text-gray-700">
                <span>Dinges 1998</span>
                <span>Caffier 2003</span>
                <span>Borbely 1982</span>
              </div>
              <div className="text-xs text-gray-700 mt-2">
                全処理ブラウザ内完結 / データ送信なし / オープンソース
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
