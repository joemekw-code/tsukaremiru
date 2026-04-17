'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { analyzeFatigue, type FatigueResult } from '@/lib/fatigue-engine';
import { canScan, recordScan, getRemainingScans } from '@/lib/scan-limit';
import { playScanStart, playScanComplete, playAlert } from '@/lib/sounds';

type ScanState = 'idle' | 'loading' | 'ready' | 'scanning' | 'done' | 'limit';

interface Props {
  onResult: (result: FatigueResult) => void;
}

export default function FatigueScanner({ onResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<ScanState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(3);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const SCAN_DURATION = 5000; // 5 seconds
  const TARGET_FPS = 15; // reasonable for browser

  const initLandmarker = useCallback(async () => {
    setState('loading');
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/models/face_landmarker.task`,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });
      landmarkerRef.current = landmarker;
      setState('ready');
    } catch (e) {
      console.error('Failed to init landmarker:', e);
      setError('モデルの読み込みに失敗しました。ページを再読み込みしてください。');
      setState('idle');
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError('カメラへのアクセスを許可してください。');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startScan = useCallback(async () => {
    if (!landmarkerRef.current || !videoRef.current) return;

    if (!canScan()) {
      setState('limit');
      return;
    }

    await startCamera();
    // Wait a moment for camera to stabilize
    await new Promise(r => setTimeout(r, 500));

    playScanStart();
    setState('scanning');
    setProgress(0);

    const earSeries: number[] = [];
    const noseYSeries: number[] = [];
    const colorSamples: Array<{ deltaE: number; brightnessDiff: number }> = [];

    const landmarker = landmarkerRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const startTime = performance.now();
    const frameInterval = 1000 / TARGET_FPS;
    let lastFrameTime = 0;
    let frameCount = 0;

    const processFrame = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      if (elapsed >= SCAN_DURATION) {
        // Done scanning
        stopCamera();

        if (earSeries.length < 10) {
          setError('顔が十分に検出できませんでした。明るい場所で再試行してください。');
          setState('ready');
          return;
        }

        const result = analyzeFatigue(earSeries, noseYSeries, colorSamples, TARGET_FPS);
        recordScan();
        setRemaining(getRemainingScans());
        if (result.fatigueScore >= 70) {
          playAlert();
        } else {
          playScanComplete();
        }
        onResult(result);
        setState('done');
        return;
      }

      setProgress(Math.round((elapsed / SCAN_DURATION) * 100));

      if (timestamp - lastFrameTime >= frameInterval) {
        lastFrameTime = timestamp;
        frameCount++;

        try {
          const detection = landmarker.detectForVideo(video, Math.round(timestamp));

          if (detection.faceLandmarks && detection.faceLandmarks.length > 0) {
            const lm = detection.faceLandmarks[0];

            // EAR
            const leftEAR = computeEAR(lm, [362, 385, 387, 263, 373, 380]);
            const rightEAR = computeEAR(lm, [33, 160, 158, 133, 153, 144]);
            earSeries.push((leftEAR + rightEAR) / 2);

            // Nose Y
            noseYSeries.push(lm[1].y);

            // Color sampling (every 5th frame)
            if (frameCount % 5 === 0) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const color = computeColorFromImageData(imageData, lm, canvas.width, canvas.height);
              colorSamples.push(color);
            }
          }
        } catch {
          // Skip frame on error
        }
      }

      requestAnimationFrame(processFrame);
    };

    requestAnimationFrame(processFrame);
  }, [startCamera, stopCamera, onResult]);

  useEffect(() => {
    setRemaining(getRemainingScans());
    initLandmarker();
    return () => {
      stopCamera();
      landmarkerRef.current?.close();
    };
  }, [initLandmarker, stopCamera]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover mirror"
          playsInline
          muted
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {state === 'scanning' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* Scanning overlay with animated corners */}
            <div className="absolute inset-8 border-2 border-emerald-400/50 rounded-xl">
              <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
              <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
              <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
              <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />
            </div>
            {/* Scan line animation */}
            <div
              className="absolute left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
              style={{
                top: `${8 + (progress / 100) * 84}%`,
                opacity: 0.8,
                transition: 'top 0.3s linear',
              }}
            />
            {/* Progress ring */}
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="#1f2937" strokeWidth="4" />
                <circle
                  cx="40" cy="40" r="36" fill="none" stroke="#10b981" strokeWidth="4"
                  strokeDasharray={`${progress * 2.26} 226`}
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-emerald-400 text-sm font-mono font-bold">{Math.ceil((100 - progress) / 20)}s</span>
              </div>
            </div>
            <div className="absolute bottom-4 text-emerald-300/80 text-xs font-medium bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
              解析中...
            </div>
          </div>
        )}

        {state === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-gray-400 text-sm animate-pulse">モデル読み込み中...</div>
          </div>
        )}

        {(state === 'idle' || state === 'ready') && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="text-center text-gray-300">
              <div className="text-4xl mb-2">📷</div>
              <div className="text-sm">カメラに向かって5秒間じっとしてください</div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-400 text-sm text-center bg-red-950/30 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {state === 'ready' && (
        <>
          <button
            onClick={startScan}
            className="relative px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl
                       transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/50
                       active:scale-95 text-lg group"
            style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              スキャン開始
            </span>
          </button>
          <div className="text-gray-600 text-xs">
            今週の残りスキャン: {remaining}/3（Proで無制限）
          </div>
        </>
      )}

      {state === 'limit' && (
        <div className="text-center space-y-3">
          <div className="text-orange-400 text-sm font-medium">
            今週の無料スキャン回数（3回）を使い切りました
          </div>
          <a
            href="https://buy.stripe.com/test_6oUbITbCKbQWg8V8b67g400"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-white text-black font-bold rounded-xl
                       hover:bg-gray-200 transition-all text-sm"
          >
            Proにアップグレード（&#65509;500/月）
          </a>
          <div className="text-gray-600 text-xs">7日間無料トライアル付き</div>
        </div>
      )}

      {state === 'loading' && (
        <div className="text-gray-500 text-sm">初回読み込みに数秒かかります...</div>
      )}
    </div>
  );
}

// Helper: compute EAR from NormalizedLandmark[]
function computeEAR(
  landmarks: Array<{ x: number; y: number; z: number }>,
  indices: number[]
): number {
  const pts = indices.map(i => landmarks[i]);
  const v1 = Math.hypot(pts[1].x - pts[5].x, pts[1].y - pts[5].y);
  const v2 = Math.hypot(pts[2].x - pts[4].x, pts[2].y - pts[4].y);
  const h = Math.hypot(pts[0].x - pts[3].x, pts[0].y - pts[3].y);
  return h > 0 ? (v1 + v2) / (2 * h) : 0.3;
}

// Helper: extract color metrics from canvas imageData
function computeColorFromImageData(
  imageData: ImageData,
  landmarks: Array<{ x: number; y: number; z: number }>,
  width: number,
  height: number
): { deltaE: number; brightnessDiff: number } {
  const LEFT_EYE_BOTTOM = [374, 380, 381, 382, 362, 263];
  const RIGHT_EYE_BOTTOM = [145, 153, 154, 155, 133, 33];

  function sampleRegion(cx: number, cy: number, size: number): [number, number, number] {
    let r = 0, g = 0, b = 0, count = 0;
    const x1 = Math.max(0, Math.floor(cx - size));
    const y1 = Math.max(0, Math.floor(cy - size));
    const x2 = Math.min(width - 1, Math.floor(cx + size));
    const y2 = Math.min(height - 1, Math.floor(cy + size));
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        const idx = (y * width + x) * 4;
        r += imageData.data[idx];
        g += imageData.data[idx + 1];
        b += imageData.data[idx + 2];
        count++;
      }
    }
    return count > 0 ? [r / count, g / count, b / count] : [128, 128, 128];
  }

  function rgbToLab(r: number, g: number, b: number): [number, number, number] {
    let rr = r / 255, gg = g / 255, bb = b / 255;
    rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92;
    gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92;
    bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92;
    let x = (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) / 0.95047;
    let y = (rr * 0.2126 + gg * 0.7152 + bb * 0.0722) / 1.0;
    let z = (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) / 1.08883;
    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
  }

  // Under-eye
  const leftBottom = LEFT_EYE_BOTTOM.map(i => landmarks[i]);
  const rightBottom = RIGHT_EYE_BOTTOM.map(i => landmarks[i]);

  const leftUnderY = Math.max(...leftBottom.map(p => p.y)) * height + 5;
  const leftUnderX = ((Math.min(...leftBottom.map(p => p.x)) + Math.max(...leftBottom.map(p => p.x))) / 2) * width;
  const rightUnderY = Math.max(...rightBottom.map(p => p.y)) * height + 5;
  const rightUnderX = ((Math.min(...rightBottom.map(p => p.x)) + Math.max(...rightBottom.map(p => p.x))) / 2) * width;

  const underRgb1 = sampleRegion(leftUnderX, leftUnderY, 8);
  const underRgb2 = sampleRegion(rightUnderX, rightUnderY, 8);
  const underRgb: [number, number, number] = [
    (underRgb1[0] + underRgb2[0]) / 2,
    (underRgb1[1] + underRgb2[1]) / 2,
    (underRgb1[2] + underRgb2[2]) / 2,
  ];

  // Cheeks
  const cheekRgb1 = sampleRegion(landmarks[425].x * width, landmarks[425].y * height, 15);
  const cheekRgb2 = sampleRegion(landmarks[205].x * width, landmarks[205].y * height, 15);
  const cheekRgb: [number, number, number] = [
    (cheekRgb1[0] + cheekRgb2[0]) / 2,
    (cheekRgb1[1] + cheekRgb2[1]) / 2,
    (cheekRgb1[2] + cheekRgb2[2]) / 2,
  ];

  const underLab = rgbToLab(...underRgb);
  const cheekLab = rgbToLab(...cheekRgb);

  const deltaE = Math.hypot(
    cheekLab[0] - underLab[0],
    cheekLab[1] - underLab[1],
    cheekLab[2] - underLab[2]
  );
  const brightnessDiff = cheekLab[0] - underLab[0];

  return { deltaE, brightnessDiff };
}
