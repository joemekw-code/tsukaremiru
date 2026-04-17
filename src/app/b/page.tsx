'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { FatigueResult } from '@/lib/fatigue-engine';

const FatigueScanner = dynamic(() => import('@/components/FatigueScanner'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-black" />,
});

/* ── B: ゲーマーHPゲージ — 17歳男性、深夜2時、ランク戦中 ──
   「俺のHP何%残ってる？」→ HPゲージが減るアニメーション
   黒×赤×緑、ピクセル風味、ゲームUI
   動機: パフォーマンス確認。「HP20%でAPEXやったらダメだろ」 */

export default function PatternB() {
  const [result, setResult] = useState<FatigueResult | null>(null);
  const [hp, setHp] = useState(100);

  useEffect(() => {
    if (result) {
      // Animate HP decrease
      const target = 100 - result.fatigueScore;
      let current = 100;
      const interval = setInterval(() => {
        current -= 2;
        if (current <= target) {
          current = target;
          clearInterval(interval);
        }
        setHp(current);
      }, 30);
      return () => clearInterval(interval);
    }
    setHp(100);
  }, [result]);

  const hpColor = hp >= 60 ? '#00cc44' : hp >= 30 ? '#ccaa00' : '#cc2222';
  const hpBg = hp >= 60 ? '#003310' : hp >= 30 ? '#332a00' : '#330808';

  return (
    <main className="h-[100dvh] flex flex-col overflow-hidden bg-black"
          style={{ fontFamily: '"JetBrains Mono", "M PLUS Rounded 1c", monospace' }}>

      {!result ? (
        <div className="flex-1 flex flex-col">
          {/* Top HUD */}
          <div className="px-4 pt-14 pb-3 flex items-center justify-between">
            <div>
              <div className="text-[9px] text-green-600/60 tracking-wider">NEMUMI // FATIGUE CHECK</div>
              <div className="text-white text-sm font-bold mt-0.5">PLAYER STATUS</div>
            </div>
            <div className="text-[9px] text-white/20 text-right">
              HP ???<br />
              <span className="text-green-600/40">SCAN TO REVEAL</span>
            </div>
          </div>

          {/* HP bar placeholder - full */}
          <div className="mx-4 mb-3">
            <div className="h-3 rounded-sm" style={{ background: '#0a1a0a', border: '1px solid #1a3a1a' }}>
              <div className="h-full rounded-sm" style={{ background: '#00cc44', width: '100%', boxShadow: '0 0 8px #00cc4440' }} />
            </div>
          </div>

          {/* Camera */}
          <div className="flex-1 mx-3 mb-2 rounded-lg overflow-hidden" style={{ border: '1px solid #1a2a1a' }}>
            <FatigueScanner onResult={setResult} />
          </div>

          {/* Bottom */}
          <div className="px-4 pb-8 text-center">
            <div className="text-[8px] text-white/15 tracking-wider">
              CAMERA 5SEC // LOCAL PROCESS // NO UPLOAD
            </div>
          </div>
        </div>
      ) : (
        /* Result - game over / status screen */
        <div className="flex-1 flex flex-col px-4 pt-14 pb-8">
          {/* HP header */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-[9px] tracking-wider" style={{ color: hpColor }}>
              {hp >= 60 ? 'CONDITION: GOOD' : hp >= 30 ? 'CONDITION: CAUTION' : 'CONDITION: CRITICAL'}
            </div>
            <div className="text-white text-sm font-bold">HP {hp}%</div>
          </div>

          {/* HP BAR - the main visual */}
          <div className="h-6 rounded-sm mb-6" style={{ background: hpBg, border: `1px solid ${hpColor}30` }}>
            <div className="h-full rounded-sm transition-all duration-100"
                 style={{ width: `${hp}%`, background: hpColor, boxShadow: `0 0 12px ${hpColor}60` }} />
          </div>

          {/* Stats grid - game UI style */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { stat: 'FATIGUE', val: result.fatigueScore, max: 100, color: '#cc2222' },
              { stat: 'SLEEP', val: result.estimatedSleepHours, max: 8, color: '#6644cc', unit: 'h' },
              { stat: 'ALERT', val: result.kss, max: 9, color: '#ccaa00' },
              { stat: 'DARK CIRCLES', val: Math.round(result.components['Dark Circles'] * 100), max: 100, color: '#4466cc' },
            ].map(({ stat, val, max, color, unit }) => (
              <div key={stat} className="p-3 rounded-lg" style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
                <div className="text-[8px] tracking-wider mb-1.5" style={{ color: `${color}80` }}>{stat}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg" style={{ color }}>{val}</span>
                  <span className="text-[9px] text-white/20">{unit || `/${max}`}</span>
                </div>
                <div className="h-1 rounded-full mt-2" style={{ background: '#1a1a1a' }}>
                  <div className="h-full rounded-full" style={{ width: `${(Number(val) / max) * 100}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Verdict */}
          <div className="text-center py-3 rounded-lg mb-4" style={{ background: `${hpColor}08`, border: `1px solid ${hpColor}20` }}>
            <div className="text-[9px] tracking-wider mb-1" style={{ color: `${hpColor}80` }}>VERDICT</div>
            <div className="text-xs text-white/50" style={{ lineHeight: '1.7' }}>
              {hp >= 60 ? 'まだ戦える。でも過信は禁物。' :
               hp >= 30 ? '判断力低下中。ミス連発する前に撤退を推奨。' :
               'HP危険域。これ以上のプレイは自傷行為。寝ろ。'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            <button onClick={() => setResult(null)}
                    className="flex-1 py-2.5 rounded-lg text-[10px] tracking-wider text-white/30"
                    style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
              RESCAN
            </button>
            <button onClick={() => {
              const t = `HP${hp}% — ${hp >= 60 ? 'まだ戦える' : hp >= 30 ? '黄色信号' : '瀕死'}\nねむみチェック`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(location.origin + '/b')}`, '_blank');
            }}
                    className="flex-1 py-2.5 rounded-lg text-[10px] tracking-wider font-bold"
                    style={{ background: hpColor, color: '#000' }}>
              SHARE STATUS
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
