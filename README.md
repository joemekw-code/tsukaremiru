# つかれみる (Tsukaremiru)

**顔は嘘をつかない。カメラで5秒スキャンするだけで、あなたの疲労度を数値化します。**

[![Try it now](https://img.shields.io/badge/Try%20it-Live%20Demo-brightgreen)](https://joemekw-code.github.io/tsukaremiru/)

## What is this?

Webカメラに5秒間向けるだけで、あなたの疲労度を学術論文ベースのアルゴリズムで数値化するWebアプリです。

- **疲労度スコア** (0-100)
- **推定睡眠時間**
- **KSS (Karolinska Sleepiness Scale)** — 国際標準の眠気尺度
- **「寝るべき度」** スコア
- **疲労レシート** — SNSでシェアできる結果画像

## How it works

8つの生体信号をブラウザ内のAIがリアルタイム解析します：

| Signal | What it measures | Reference |
|--------|-----------------|-----------|
| PERCLOS | 目の閉じ具合の時間割合 | Dinges et al. (1998) |
| Blink Duration | 瞬きの持続時間 | Caffier et al. (2003) |
| Slow Blink Ratio | 遅い瞬き(>200ms)の割合 | Schleicher et al. (2008) |
| Dark Circles (ΔE) | 目の下の色差(クマ) | CIE LAB color space |
| Brightness Diff | 目下と頬の明度差 | Periorbital analysis |
| Head Movement | 頭部の動揺パターン | Abe et al. (2011) |
| EAR Variability | 目の開き安定性 | Soukupova & Cech (2016) |
| Circadian Model | 体内時計に基づく理論推定 | Borbely (1982) |

## Privacy

**映像データはサーバーに一切送信されません。** すべての解析はブラウザ内のMediaPipe Face Landmarkerで完結します。

## Tech Stack

- Next.js (Static Export)
- MediaPipe Face Landmarker (browser-side)
- Tailwind CSS
- TypeScript

## Try it

https://joemekw-code.github.io/tsukaremiru/

スマホでもPCでも、カメラがあれば使えます。
