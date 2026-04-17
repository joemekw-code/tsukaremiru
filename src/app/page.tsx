'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-md aspect-[4/3] bg-gray-900 rounded-2xl flex items-center justify-center">
      <div className="text-gray-500 animate-pulse">Loading...</div>
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            つかれみる
          </h1>
          <p className="text-gray-500 text-sm">
            顔は嘘をつかない。5秒で疲労を数値化。
          </p>
        </div>

        {!result ? (
          <>
            <FatigueScanner onResult={setResult} />

            <div className="mt-12 space-y-6">
              <h2 className="text-center text-gray-500 text-xs font-medium tracking-wider uppercase">
                How it works
              </h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl mb-2">📷</div>
                  <div className="text-xs text-gray-400">カメラで<br/>5秒スキャン</div>
                </div>
                <div>
                  <div className="text-2xl mb-2">🧠</div>
                  <div className="text-xs text-gray-400">8つの生体信号を<br/>AI解析</div>
                </div>
                <div>
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-xs text-gray-400">疲労度を<br/>数値化</div>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">計測する指標</h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>PERCLOS (目の閉じ具合)</div>
                  <div>瞬き持続時間</div>
                  <div>目の下の色差 (クマ)</div>
                  <div>顔色の明度差</div>
                  <div>頭部の動揺</div>
                  <div>サーカディアンモデル</div>
                  <div>目の開き安定性</div>
                  <div>遅い瞬きの割合</div>
                </div>
              </div>

              <div className="text-center text-xs text-gray-600 space-y-1">
                <p>データはブラウザ内で処理されます。映像はサーバーに送信されません。</p>
                <p>学術論文ベースのアルゴリズム (Dinges 1998, Caffier 2003, Borbely 1982)</p>
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
